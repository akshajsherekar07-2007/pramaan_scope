import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { APP_ID, SLOT_NAMES, type Application, type AuditEvent, type Clarification, type DocumentVersion, type Fact, type FixtureMode, type Impact, type PageText, type Persona, type Review, type Slot, type Snapshot, type SourceAttempt } from '../shared/types.js';
import { evaluate, fieldLabel, parseFacts } from './rules.js';
import { BASE_APPLICATION, CORRECTED_TEXT, SAMPLE_TEXT, makeSamplePDF } from './seed.js';
import { detectMime, extractPdf } from './documents.js';

const now = () => new Date().toISOString();
export class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
export class Store {
  readonly db: DatabaseSync;
  readonly files: string;
  readonly samples: string;
  constructor(readonly root: string) {
    this.files = join(root, 'originals'); this.samples = join(root, 'samples');
    mkdirSync(this.files, { recursive: true }); mkdirSync(this.samples, { recursive: true });
    this.db = new DatabaseSync(join(root, 'pramaanscope.sqlite'));
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
      CREATE TABLE IF NOT EXISTS application (id TEXT PRIMARY KEY, payload TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS documents (id TEXT PRIMARY KEY, payload TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS runs (id INTEGER PRIMARY KEY AUTOINCREMENT, payload TEXT NOT NULL, created_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS reviews (id TEXT PRIMARY KEY, payload TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS clarifications (id TEXT PRIMARY KEY, payload TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS source_attempts (id TEXT PRIMARY KEY, payload TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS settings (id TEXT PRIMARY KEY, payload TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT NOT NULL, detail TEXT NOT NULL, actor TEXT NOT NULL, created_at TEXT NOT NULL);`);
  }
  close() { this.db.close(); }
  private rows<T>(table: 'documents' | 'reviews' | 'clarifications' | 'source_attempts'): T[] { return (this.db.prepare(`SELECT payload FROM ${table} ORDER BY rowid`).all() as { payload: string }[]).map(row => JSON.parse(row.payload)); }
  private put(table: 'documents' | 'reviews' | 'clarifications' | 'source_attempts', id: string, payload: unknown) { this.db.prepare(`INSERT OR REPLACE INTO ${table}(id,payload) VALUES(?,?)`).run(id, JSON.stringify(payload)); }
  app(): Application { const row = this.db.prepare('SELECT payload FROM application WHERE id=?').get(APP_ID) as { payload: string } | undefined; if (!row) throw new HttpError(404, 'Demo application has not been initialized.'); return JSON.parse(row.payload); }
  setApp(app: Application) { this.db.prepare('INSERT OR REPLACE INTO application(id,payload) VALUES(?,?)').run(APP_ID, JSON.stringify(app)); }
  allDocs() { return this.rows<DocumentVersion>('documents'); }
  doc(id: string) { const doc = this.allDocs().find(item => item.id === id); if (!doc) throw new HttpError(404, 'Document not found.'); return doc; }
  file(id: string) { this.doc(id); return readFileSync(join(this.files, id)); }
  infrastructure(): { outcome: string; note: string } { const row = this.db.prepare("SELECT payload FROM settings WHERE id='infrastructure'").get() as { payload: string } | undefined; return row ? JSON.parse(row.payload) : { outcome: 'PENDING', note: '' }; }
  event(type: string, detail: string, actor: string) { this.db.prepare('INSERT INTO events(type,detail,actor,created_at) VALUES(?,?,?,?)').run(type, detail, actor, now()); }
  private transaction<T>(run: () => T): T { this.db.exec('BEGIN IMMEDIATE'); try { const result = run(); this.db.exec('COMMIT'); return result; } catch (error) { this.db.exec('ROLLBACK'); throw error; } }
  analyse(recordSource = false) {
    const app = this.app(); const findings = evaluate(app, this.allDocs(), this.infrastructure());
    this.db.prepare('INSERT INTO runs(payload,created_at) VALUES(?,?)').run(JSON.stringify({ revision: app.revision, findings }), now());
    if (recordSource) {
      const cert = this.allDocs().find(doc => doc.slot === 'certificate' && doc.state === 'ACTIVE');
      const attempt: SourceAttempt = { id: randomUUID(), mode: 'SIMULATED', outcome: app.fixtureMode, queriedIdentifier: cert?.facts.find(fact => fact.field === 'certificateId')?.value || 'Not extracted', source: 'Synthetic issuing-source adapter', timestamp: now(), coverage: 'Fixture only. Compares a synthetic certificate identifier; no government source contacted.' };
      this.put('source_attempts', attempt.id, attempt);
    }
    return findings;
  }
  snapshot(): Snapshot {
    const row = this.db.prepare('SELECT payload FROM runs ORDER BY id DESC LIMIT 1').get() as { payload: string } | undefined;
    return { application: this.app(), documents: this.allDocs(), findings: row ? JSON.parse(row.payload).findings : [], reviews: this.rows('reviews'), clarifications: this.rows('clarifications'), sourceAttempts: this.rows('source_attempts'), infrastructure: this.infrastructure(), events: (this.db.prepare('SELECT id,type,detail,actor,created_at as createdAt FROM events ORDER BY id DESC').all() as unknown as AuditEvent[]) };
  }
  async initialize() { if (!this.db.prepare('SELECT id FROM application LIMIT 1').get()) await this.reset(); }
  async reset() {
    const samples = (Object.keys(SAMPLE_TEXT) as (keyof typeof SAMPLE_TEXT)[]).map(slot => ({ slot, name: `${slot}.pdf`, buffer: makeSamplePDF(slot, SAMPLE_TEXT[slot]) }));
    writeFileSync(join(this.samples, 'certificate-corrected.pdf'), makeSamplePDF('certificate', CORRECTED_TEXT));
    for (const sample of samples) writeFileSync(join(this.samples, sample.name), sample.buffer);
    const prepared: DocumentVersion[] = [];
    for (const sample of samples) prepared.push({ ...await this.prepare(sample.slot, sample.name, sample.buffer, 'ACTIVE', null, 'Initial synthetic submission'), version: 1 });
    const imagePath = resolve('public/samples/undertaking-scan.png');
    if (existsSync(imagePath)) writeFileSync(join(this.samples, 'undertaking-scan.png'), readFileSync(imagePath));
    const infraPath = resolve('public/samples/infrastructure.png');
    if (existsSync(infraPath)) prepared.push({ ...await this.prepare('infrastructure', 'campus-evidence.png', readFileSync(infraPath), 'ACTIVE', null, 'Illustrative synthetic infrastructure evidence'), version: 1 });
    this.transaction(() => {
      for (const table of ['application', 'documents', 'runs', 'reviews', 'clarifications', 'source_attempts', 'settings', 'events']) this.db.exec(`DELETE FROM ${table}`);
      this.setApp({ ...BASE_APPLICATION });
      for (const doc of prepared) this.put('documents', doc.id, doc);
      this.event('APPLICATION_CREATED', 'Synthetic Campus A application loaded with four extracted PDFs. No government integration.', 'System');
      this.analyse(true);
    });
    return this.snapshot();
  }
  private async prepare(slot: Slot, name: string, bytes: Buffer, state: DocumentVersion['state'], previousId: string | null, reason: string): Promise<DocumentVersion> {
    const mime = detectMime(bytes); if (!mime) throw new HttpError(400, 'Only valid PDF, PNG, or JPEG files are accepted.');
    const id = randomUUID(); let pages: PageText[] = []; let facts: Fact[] = []; let status: DocumentVersion['status'] = mime === 'application/pdf' ? 'READY' : slot === 'infrastructure' ? 'READY' : 'NEEDS_OCR'; let error = '';
    if (mime === 'application/pdf') {
      try { const extracted = await extractPdf(bytes); pages = extracted.pages; facts = extracted.facts; status = extracted.status; }
      catch (failure) { status = 'ERROR'; error = failure instanceof Error ? failure.message : 'Could not read PDF.'; }
    }
    writeFileSync(join(this.files, id), bytes, { flag: 'wx' });
    return { id, slot, version: Math.max(0, ...this.allDocs().filter(doc => doc.slot === slot).map(doc => doc.version)) + 1, name: name.replace(/[\r\n\x00-\x1f]/g, '').slice(0, 180), mime, hash: createHash('sha256').update(bytes).digest('hex'), size: bytes.length, state, status, error, pages, facts, createdAt: now(), previousId, reason };
  }
  async upload(slot: Slot, name: string, bytes: Buffer, reason: string, candidate: boolean, actor: string) {
    const previous = this.allDocs().find(doc => doc.slot === slot && doc.state === 'ACTIVE');
    if (previous && !candidate) throw new HttpError(409, 'This slot already has evidence. Request clarification and use a replacement candidate.');
    if (candidate) {
      if (!previous) throw new HttpError(400, 'No active document exists to replace.');
      if (!this.rows<Clarification>('clarifications').some(item => item.slot === slot && item.status === 'OPEN')) throw new HttpError(409, 'A reviewer must request clarification for this document before a replacement can be proposed.');
      if (!reason.trim()) throw new HttpError(400, 'A correction reason is required.');
    }
    const doc = await this.prepare(slot, name, bytes, candidate ? 'CANDIDATE' : 'ACTIVE', previous?.id || null, reason);
    this.transaction(() => {
      this.put('documents', doc.id, doc); this.event(candidate ? 'REPLACEMENT_PROPOSED' : 'DOCUMENT_UPLOADED', `${SLOT_NAMES[slot]}: ${doc.name}`, actor);
      if (!candidate) { const app = this.app(); app.revision++; this.setApp(app); this.analyse(slot === 'certificate'); }
    });
    return doc;
  }
  ocr(id: string, text: string, actor: string) {
    const doc = this.doc(id);
    if (!doc.mime.startsWith('image/') || doc.state === 'SUPERSEDED') throw new HttpError(400, 'Local OCR input is accepted only for current image evidence.');
    if (text.trim().length < 3) throw new HttpError(400, 'OCR did not find readable text. Try a clearer image.');
    // Native image bytes remain immutable. OCR is a separate, explicitly client-produced assertion.
    if (doc.status === 'READY' && doc.facts.length) throw new HttpError(409, 'This image already has extraction. Use a recorded field correction instead.');
    doc.pages = [{ page: 1, text }]; doc.facts = parseFacts(doc.pages, 'LOCAL_OCR'); doc.status = 'READY'; doc.error = '';
    this.transaction(() => { this.put('documents', id, doc); this.event('LOCAL_OCR_RECORDED', `${doc.name}: client-produced OCR, not independently verified.`, actor); if (doc.state === 'ACTIVE') { const app = this.app(); app.revision++; this.setApp(app); this.analyse(); } });
    return this.snapshot();
  }
  review(key: string, action: Review['action'], note: string, actor = 'Demo reviewer') {
    const snapshot = this.snapshot(); const finding = snapshot.findings.find(item => item.key === key);
    if (!finding) throw new HttpError(404, 'Finding not found.');
    if (!note.trim()) throw new HttpError(400, 'A review note is required.');
    const review: Review = { id: randomUUID(), findingKey: key, fingerprint: finding.fingerprint, action, note: note.trim(), actor, createdAt: now() };
    this.transaction(() => {
      this.put('reviews', review.id, review);
      const app = this.app(); app.revision++;
      if (action === 'CLARIFICATION') {
        const related = finding.evidence[0]?.documentId || snapshot.documents.find(doc => finding.dependencyIds.includes(doc.id))?.id;
        const slot = related ? this.doc(related).slot : key === 'infrastructure-readiness' ? 'infrastructure' : key.includes('certificate') || key === 'campus-scope' || key === 'source-verification' ? 'certificate' : 'application';
        const clarification: Clarification = { id: randomUUID(), findingKey: key, slot, note: note.trim(), status: 'OPEN', createdAt: now() };
        this.put('clarifications', clarification.id, clarification); app.workflow = 'CLARIFICATION_REQUESTED';
      }
      this.setApp(app); this.event(action, `${finding.title}: ${note.trim()}`, actor);
    });
    return this.snapshot();
  }
  impact(id: string): Impact {
    const snapshot = this.snapshot(); const candidate = this.doc(id);
    if (candidate.state !== 'CANDIDATE' || !candidate.previousId) throw new HttpError(409, 'Select a pending replacement candidate.');
    const original = this.doc(candidate.previousId);
    if (original.state !== 'ACTIVE') throw new HttpError(409, 'This candidate refers to an older version. Propose a new replacement against the active document.');
    const nextDocs = snapshot.documents.map(doc => doc.id === original.id ? { ...doc, state: 'SUPERSEDED' as const } : doc.id === candidate.id ? { ...doc, state: 'ACTIVE' as const } : doc);
    const nextFindings = evaluate(snapshot.application, nextDocs, snapshot.infrastructure);
    const affected = snapshot.findings.filter(finding => finding.dependencyIds.includes(original.id)).map(before => ({ before, after: nextFindings.find(finding => finding.key === before.key) || null, reviews: snapshot.reviews.filter(review => review.findingKey === before.key && review.fingerprint === before.fingerprint && review.action !== 'CLARIFICATION').length }));
    const allFields = [...new Set([...original.facts, ...candidate.facts].map(fact => fact.field))];
    const stringify = (doc: DocumentVersion, field: string) => [...new Set(doc.facts.filter(fact => fact.field === field).map(fact => fact.value))].join(' / ') || 'Not extracted';
    const changes = allFields.flatMap(field => { const before = stringify(original, field); const after = stringify(candidate, field); return before === after ? [] : [{ field: fieldLabel(field), before, after }]; });
    return { candidateId: id, applicationRevision: snapshot.application.revision, original, candidate, changes, affected, unchanged: snapshot.findings.filter(finding => !finding.dependencyIds.includes(original.id)), affectedReviews: affected.reduce((sum, item) => sum + item.reviews, 0) };
  }
  confirm(id: string, expectedRevision: number, actor = 'Demo reviewer') {
    return this.transaction(() => {
      const app = this.app(); if (app.revision !== expectedRevision) throw new HttpError(409, 'The application changed after this preview. Refresh the impact preview before confirming.');
      const impact = this.impact(id);
      if (impact.candidate.status !== 'READY' || (impact.candidate.slot !== 'infrastructure' && !impact.candidate.facts.length)) throw new HttpError(400, 'Extract readable information before accepting this replacement.');
      const open = this.rows<Clarification>('clarifications').filter(item => item.slot === impact.candidate.slot && item.status === 'OPEN');
      if (!open.length) throw new HttpError(409, 'No open clarification permits this replacement.');
      this.put('documents', impact.original.id, { ...impact.original, state: 'SUPERSEDED' });
      this.put('documents', id, { ...impact.candidate, state: 'ACTIVE' });
      for (const clarification of open) this.put('clarifications', clarification.id, { ...clarification, status: 'RESPONDED' });
      app.revision++; app.workflow = 'RE_REVIEW'; this.setApp(app);
      this.analyse(impact.candidate.slot === 'certificate');
      this.event('REPLACEMENT_ACCEPTED', `${SLOT_NAMES[impact.candidate.slot]} v${impact.original.version} to v${impact.candidate.version}; ${impact.affected.length} findings recalculated; ${impact.affectedReviews} previous review actions need reconsideration.`, actor);
      return this.snapshot();
    });
  }
  setFixture(mode: FixtureMode, actor = 'Demo reviewer') { this.transaction(() => { const app = this.app(); app.fixtureMode = mode; app.revision++; this.setApp(app); this.analyse(true); this.event('SOURCE_SIMULATION_CHANGED', `Synthetic adapter: ${mode}. No external issuer contacted.`, actor); }); return this.snapshot(); }
  assessInfrastructure(outcome: string, note: string, actor = 'Demo reviewer') { this.transaction(() => { this.db.prepare("INSERT OR REPLACE INTO settings(id,payload) VALUES('infrastructure',?)").run(JSON.stringify({ outcome, note })); const app = this.app(); app.revision++; this.setApp(app); this.analyse(); this.event('INFRASTRUCTURE_ASSESSMENT', `${outcome}: ${note}`, actor); }); return this.snapshot(); }
  history() { return (this.db.prepare('SELECT id,payload,created_at as createdAt FROM runs ORDER BY id DESC LIMIT 30').all() as { id: number; payload: string; createdAt: string }[]).map(row => ({ id: row.id, createdAt: row.createdAt, ...JSON.parse(row.payload) })); }
  completeReview(actor = 'Demo reviewer') {
    const snapshot = this.snapshot();
    if (snapshot.clarifications.some(item => item.status === 'OPEN')) throw new HttpError(409, 'Resolve open clarification requests before completing this review session.');
    if (snapshot.findings.some(finding => { const current = snapshot.reviews.filter(review => review.findingKey === finding.key && review.fingerprint === finding.fingerprint).at(-1); return !current || current.action === 'CLARIFICATION'; })) throw new HttpError(409, 'Record a current review action for every finding first. Unresolved verification must remain explicitly documented.');
    this.transaction(() => { const app = this.app(); app.workflow = 'REVIEW_COMPLETE'; app.revision++; this.setApp(app); this.event('REVIEW_SESSION_COMPLETED', 'All current findings reviewed. Unresolved source verification and other limitations remain in the report. No regulatory approval granted.', actor); });
    return this.snapshot();
  }
}
