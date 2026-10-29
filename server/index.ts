import express, { type NextFunction, type Request, type Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { resolve, join } from 'node:path';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { APP_ID, SLOT_NAMES, type Finding, type Persona, type Slot, type Snapshot } from '../shared/types.js';
import { Store, HttpError } from './store.js';
import { reportPdf } from './report.js';
import { renderPdfPage } from './documents.js';
import { Auth, type Identity } from './auth.js';

export async function createApp(root = resolve(process.env.PRAMAAN_DATA_DIR || (process.env.PRAMAAN_MODE === 'pilot' ? '.pilot-data' : 'data')), options: { mode?: 'demo' | 'pilot'; clock?: () => number } = {}) {
  const mode = options.mode || process.env.PRAMAAN_MODE || 'demo';
  if (mode !== 'demo' && mode !== 'pilot') throw new Error('PRAMAAN_MODE must be demo or pilot.');
  const store = new Store(root); await store.initialize();
  const auth = mode === 'pilot' ? new Auth(store.db, root, options.clock) : null;
  const app = express(); app.disable('x-powered-by');
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('Referrer-Policy', 'same-origin');
    if (req.path.startsWith('/api')) {
      res.setHeader('Cache-Control', 'no-store');
      const origin = req.headers.origin;
      const localOrigin = origin && /^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin);
      const sameOrigin = origin === `http://${req.headers.host}`;
      const localDev = origin === 'http://127.0.0.1:5177' || origin === 'http://localhost:5177';
      if (origin && (!localOrigin || (!sameOrigin && !localDev))) return res.status(403).json({ error: 'This synthetic-data prototype accepts local application requests only.' });
      if (!['GET', 'HEAD'].includes(req.method) && req.headers['x-pramaanscope'] !== 'local-demo') return res.status(403).json({ error: 'Use the local demonstration application.' });
    }
    next();
  });
  app.use(express.json({ limit: '2mb' }));
  const wrap = (fn: (req: Request, res: Response) => unknown) => (req: Request, res: Response, next: NextFunction) => Promise.resolve().then(() => fn(req, res)).catch(next);
  const identities = new WeakMap<Request, Identity>();
  const identity = (req: Request) => identities.get(req);
  const persona = (req: Request): Persona => auth ? identity(req)!.user.role : req.headers['x-demo-persona'] === 'INSTITUTION' ? 'INSTITUTION' : 'REVIEWER';
  const actor = (req: Request) => identity(req) ? `${identity(req)!.user.name} [${identity(req)!.user.id}]` : 'Demo reviewer';
  const reviewer = (req: Request) => { if (persona(req) !== 'REVIEWER') throw new HttpError(403, auth ? 'This action requires a reviewer account.' : 'Switch to the Reviewer demonstration persona for this action. This is not production authentication.'); };
  const visibleFinding = (finding: Finding): Finding => finding.key === 'infrastructure-readiness' ? { ...finding, dependencyIds: finding.dependencyIds.filter(value => !value.startsWith('assessment:')), reason: 'Infrastructure evidence requires a recorded reviewer assessment. The current review outcome is shown; reviewer notes remain private. No physical compliance certification is implied.' } : finding;
  const visible = (req: Request, snapshot: Snapshot): Snapshot => !auth || persona(req) === 'REVIEWER' ? snapshot : {
    ...snapshot, reviewVisibility: 'STATUS_ONLY', reviews: snapshot.reviews.map(review => ({ ...review, note: '', actor: 'Review team' })),
    findings: snapshot.findings.map(visibleFinding), events: [], sourceAttempts: [], infrastructure: { ...snapshot.infrastructure, note: '' },
  };
  app.get('/api/auth/session', (req, res) => res.json(auth ? auth.session(auth.resolve(req)) : { mode: 'demo', setupRequired: false, user: null, csrf: '', expiresAt: null }));
  app.post('/api/auth/setup', wrap(async (req, res) => {
    if (!auth) throw new HttpError(404, 'Protected account setup is not enabled in demonstration mode.');
    const session = await auth.bootstrap(req, res, req.body); store.event('ACCOUNT_SETUP', 'First reviewer account created for this application.', `${session.user!.name} [${session.user!.id}]`); res.status(201).json(session);
  }));
  app.post('/api/auth/login', wrap(async (req, res) => {
    if (!auth) throw new HttpError(404, 'Sign-in is not enabled in demonstration mode.');
    const session = await auth.login(req, res, req.body); store.event('SIGNED_IN', 'Account signed in.', `${session.user!.name} [${session.user!.id}]`); res.json(session);
  }));
  app.get('/api/health', (_req, res) => res.json({ status: 'ok', storage: 'SQLite', mode: auth ? 'LOCAL_PROTECTED_PILOT' : 'LOCAL_SYNTHETIC_DEMO', issuerIntegration: 'SIMULATED', signatureValidation: 'NOT_IMPLEMENTED' }));
  app.use('/api', (req, _res, next) => {
    if (!auth) return next();
    const current = auth.resolve(req);
    if (!current) return next(new HttpError(401, 'Sign in to access this workspace.'));
    if (current.user.applicationId !== APP_ID) return next(new HttpError(403, 'This account is not assigned to this application.'));
    identities.set(req, current);
    try { if (!['GET', 'HEAD'].includes(req.method)) auth.requireCsrf(req, current); next(); } catch (error) { next(error); }
  });
  app.post('/api/auth/logout', wrap((req, res) => { if (!auth) throw new HttpError(404, 'Sign-in is not enabled.'); auth.logout(req, res, identity(req)!); store.event('SIGNED_OUT', 'Account signed out.', actor(req)); res.json({ ok: true }); }));
  app.get('/api/auth/users', wrap((req, res) => { reviewer(req); if (!auth) throw new HttpError(404, 'Account administration requires protected mode.'); res.json(auth.listUsers()); }));
  app.post('/api/auth/users', wrap(async (req, res) => { reviewer(req); if (!auth) throw new HttpError(404, 'Account administration requires protected mode.'); const user = await auth.createInstitution(req.body); store.event('ACCOUNT_CREATED', `Institution account ${user.username} assigned to ${user.applicationId}.`, actor(req)); res.status(201).json(user); }));
  app.post('/api/auth/users/:id/disable', wrap((req, res) => { reviewer(req); if (!auth) throw new HttpError(404, 'Account administration requires protected mode.'); const user = auth.disableInstitution(req.params.id); store.event('ACCOUNT_DISABLED', `Institution account ${user.username} disabled; sessions revoked.`, actor(req)); res.json({ ok: true }); }));
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024, files: 1 } });
  const previewCache = new Map<string, Buffer>();
  const pendingPreviews = new Map<string, Promise<Buffer>>();
  const slotSchema = z.enum(Object.keys(SLOT_NAMES) as [Slot, ...Slot[]]);
  app.param('appId', (_req, _res, next, id) => next(id === APP_ID ? undefined : new HttpError(404, 'Application not found.')));
  app.get('/api/applications/:appId', (req, res) => res.json(visible(req, store.snapshot())));
  app.post('/api/demo/reset', wrap(async (req, res) => { reviewer(req); if (auth) throw new HttpError(403, 'Reset is disabled in protected mode. Use a separate disposable demonstration workspace.'); const { confirmation } = z.object({ confirmation: z.literal('RESET SYNTHETIC DEMO') }).parse(req.body); if (confirmation) res.json(await store.reset()); }));
  app.post('/api/applications/:appId/documents', upload.single('file'), wrap(async (req, res) => {
    if (!req.file) throw new HttpError(400, 'Choose a PDF, PNG, or JPEG file.');
    const slot = slotSchema.parse(req.body.slot); const reason = z.string().max(2000).parse(req.body.reason || '');
    const candidate = req.body.candidate === 'true';
    const doc = await store.upload(slot, req.file.originalname, req.file.buffer, reason, candidate, auth ? actor(req) : persona(req));
    res.status(201).json({ document: doc, snapshot: visible(req, store.snapshot()) });
  }));
  app.get('/api/documents/:id/file', wrap((req, res) => {
    const doc = store.doc(req.params.id); res.setHeader('Content-Type', doc.mime);
    res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(doc.name)}`); res.send(store.file(doc.id));
  }));
  app.get('/api/documents/:id/page/:page', wrap(async (req, res) => {
    const doc = store.doc(req.params.id); const page = z.coerce.number().int().min(1).max(10).parse(req.params.page);
    if (doc.mime !== 'application/pdf') throw new HttpError(400, 'Page previews are available for PDF originals.');
    const key = `${doc.id}:${page}`;
    let bytes = previewCache.get(key);
    if (!bytes) {
      let work = pendingPreviews.get(key);
      if (!work) { work = renderPdfPage(store.file(doc.id), page); pendingPreviews.set(key, work); }
      try { bytes = await work; } catch { throw new HttpError(422, 'This page cannot be previewed. Use Open original to inspect the PDF.'); } finally { pendingPreviews.delete(key); }
      previewCache.set(key, bytes);
      while (previewCache.size > 16 || [...previewCache.values()].reduce((sum, value) => sum + value.length, 0) > 32 * 1024 * 1024) previewCache.delete(previewCache.keys().next().value!);
    }
    res.setHeader('Content-Type', 'image/png'); res.send(bytes);
  }));
  app.post('/api/documents/:id/ocr', wrap((req, res) => { const { text } = z.object({ text: z.string().max(1_000_000) }).parse(req.body); res.json(visible(req, store.ocr(req.params.id, text, auth ? actor(req) : persona(req)))); }));
  app.post('/api/applications/:appId/analyse', wrap((req, res) => { reviewer(req); store.analyse(); store.event('ANALYSIS_RUN', 'Demonstration checklist recalculated against active evidence.', actor(req)); res.json(store.snapshot()); }));
  app.post('/api/findings/:key/reviews', wrap((req, res) => {
    reviewer(req); const body = z.object({ action: z.enum(['REVIEWED', 'CLARIFICATION', 'MANUAL_VERIFICATION', 'INSPECTION']), note: z.string().trim().min(1).max(2000) }).parse(req.body);
    res.json(store.review(req.params.key, body.action, body.note, actor(req)));
  }));
  app.get('/api/documents/:id/impact', wrap((req, res) => { const impact = store.impact(req.params.id); res.json(auth && persona(req) === 'INSTITUTION' ? { ...impact, affectedReviews: 0, unchanged: impact.unchanged.map(visibleFinding), affected: impact.affected.map(row => ({ ...row, before: visibleFinding(row.before), after: row.after ? visibleFinding(row.after) : null, reviews: 0 })) } : impact); }));
  app.post('/api/documents/:id/confirm', wrap((req, res) => { reviewer(req); const { revision } = z.object({ revision: z.number().int().positive() }).parse(req.body); res.json(store.confirm(req.params.id, revision, actor(req))); }));
  app.post('/api/applications/:appId/source', wrap((req, res) => { reviewer(req); const { mode } = z.object({ mode: z.enum(['MATCH', 'MISMATCH', 'UNAVAILABLE']) }).parse(req.body); res.json(store.setFixture(mode, actor(req))); }));
  app.post('/api/applications/:appId/infrastructure', wrap((req, res) => {
    reviewer(req); const body = z.object({ outcome: z.enum(['REVIEWED', 'INSPECTION']), note: z.string().trim().min(5).max(2000) }).parse(req.body);
    res.json(store.assessInfrastructure(body.outcome, body.note, actor(req)));
  }));
  app.get('/api/applications/:appId/history', wrap((req, res) => { reviewer(req); res.json(store.history()); }));
  app.post('/api/applications/:appId/complete-review', wrap((req, res) => { reviewer(req); res.json(store.completeReview(actor(req))); }));
  app.get('/api/applications/:appId/report', wrap((req, res) => { reviewer(req); res.setHeader('Content-Type', 'application/pdf'); res.setHeader('Content-Disposition', 'attachment; filename="PramaanScope-review-report.pdf"'); res.send(reportPdf(store.snapshot())); }));
  app.get('/api/demo/samples/:name', wrap((req, res) => {
    const allowed = ['application.pdf', 'approval.pdf', 'certificate.pdf', 'undertaking.pdf', 'certificate-corrected.pdf', 'undertaking-scan.png'];
    if (!allowed.includes(req.params.name)) throw new HttpError(404, 'Sample not found.');
    const path = join(store.samples, req.params.name); if (!existsSync(path)) throw new HttpError(404, 'Sample not available.'); res.download(path);
  }));
  app.use('/ocr', express.static(resolve('public/ocr'), { maxAge: '1d' }));
  app.use('/samples', express.static(resolve('public/samples'), { maxAge: '1h' }));
  const dist = resolve('dist');
  if (existsSync(dist)) { app.use(express.static(dist)); app.get('*', (req, res) => req.path.startsWith('/api/') ? res.status(404).json({ error: 'API route not found.' }) : res.sendFile(join(dist, 'index.html'))); }
  else app.get('/', (_req, res) => res.type('text').send('API ready. Run npm run dev:web or npm run build to open PramaanScope.'));
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ') });
    if (err instanceof multer.MulterError) return res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'File exceeds the 10 MB limit.' : err.message });
    const status = err instanceof HttpError ? err.status : 500;
    if (status === 500) console.error(err);
    res.status(status).json({ error: status === 500 ? 'The operation failed. Your existing evidence is retained. Retry or check the local server log.' : (err as Error).message });
  });
  return { app, store, auth };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { app, store } = await createApp(); const port = Number(process.env.PORT || 47261);
  const server = app.listen(port, '127.0.0.1', () => console.log(`PramaanScope ready: http://127.0.0.1:${port}\nSQLite and originals: ${store.root}\nSynthetic data. Issuer verification is simulated.`));
  const close = () => server.close(() => { store.close(); process.exit(0); });
  process.once('SIGINT', close); process.once('SIGTERM', close);
}
