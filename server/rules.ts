import { createHash } from 'node:crypto';
import { RULE_VERSION, SLOT_NAMES, type Application, type DocumentVersion, type EvidenceRef, type Fact, type Finding, type PageText, type Slot, type Status } from '../shared/types.js';

const labels: Record<string, string> = {
  institutionId: 'Institution ID', institution: 'Institution Name', campus: 'Campus',
  period: 'Academic Year', approvalPeriod: 'Approval Period', course: 'Course',
  intake: 'Approved Intake', certificateId: 'Certificate ID', validFrom: 'Valid From',
  validUntil: 'Valid Until', issuer: 'Issuer', declaration: 'Declaration'
};
const patterns: Record<string, RegExp> = {
  institutionId: /^Institution\s*(?:ID|Identifier)\s*:\s*(.+)$/im,
  institution: /^Institution\s*Name\s*:\s*(.+)$/im,
  campus: /^(?:Declared\s+)?Campus\s*:\s*(.+)$/im,
  period: /^Academic\s*Year\s*:\s*(.+)$/im,
  approvalPeriod: /^Approval\s*Period\s*:\s*(.+)$/im,
  course: /^Course\s*:\s*(.+)$/im,
  intake: /^(?:Previously\s+)?Approved\s*Intake\s*:\s*(.+)$/im,
  certificateId: /^Certificate\s*(?:ID|Number)\s*:\s*(.+)$/im,
  validFrom: /^Valid\s*From\s*:\s*(.+)$/im,
  validUntil: /^Valid\s*(?:Until|To)\s*:\s*(.+)$/im,
  issuer: /^Issuer\s*:\s*(.+)$/im,
  declaration: /^Declaration\s*:\s*(.+)$/im
};
export const fieldLabel = (field: string) => labels[field] || field;
export const normalize = (value: string) => value.trim().replace(/\s+/g, ' ').toUpperCase();
export function parseFacts(pages: PageText[], method: Fact['method']): Fact[] {
  return Object.entries(patterns).flatMap(([field, pattern]) => pages.flatMap(page => {
    const matches = [...page.text.matchAll(new RegExp(pattern.source, 'gim'))];
    return matches.map(match => ({ field, value: match[1].trim(), raw: match[0].trim(), page: page.page, method }));
  }));
}
export function isoDate(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(value + 'T00:00:00.000Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? value : null;
}
export function evaluate(application: Application, documents: DocumentVersion[], infrastructure: { outcome: string; note: string }): Finding[] {
  const docs = documents.filter(doc => doc.state === 'ACTIVE');
  const get = (slot: Slot) => docs.find(doc => doc.slot === slot);
  const facts = (doc: DocumentVersion | undefined, field: string) => doc?.facts.filter(fact => fact.field === field) || [];
  const val = (doc: DocumentVersion | undefined, field: string) => {
    const values = [...new Set(facts(doc, field).map(fact => normalize(fact.value)))];
    return values.length === 1 ? values[0] : '';
  };
  const ref = (doc: DocumentVersion | undefined, fields?: string[]): EvidenceRef[] => !doc ? [] : doc.facts.filter(fact => !fields || fields.includes(fact.field)).map(fact => ({ documentId: doc.id, name: doc.name, page: fact.page, quote: fact.raw, field: fact.field }));
  const rows: Finding[] = [];
  function add(key: string, group: string, title: string, status: Status, reason: string, documents: (DocumentVersion | undefined)[], evidence: EvidenceRef[], nextAction: string, extraDeps: string[] = [], sourceStatus: Finding['sourceStatus'] = 'NOT_CHECKED') {
    const dependencyIds = [...documents.filter(Boolean).map(doc => doc!.id), ...extraDeps, `rule:${RULE_VERSION}`];
    const payload = { key, group, title, status, reason, evidence, dependencyIds, nextAction, ruleVersion: RULE_VERSION, sourceStatus };
    rows.push({ ...payload, fingerprint: createHash('sha256').update(JSON.stringify(payload)).digest('hex') });
  }
  const required: Slot[] = ['application', 'approval', 'certificate', 'undertaking'];
  const missing = required.filter(slot => !get(slot));
  const unreadable = required.filter(slot => get(slot) && (get(slot)!.status !== 'READY' || !get(slot)!.facts.length));
  add('completeness', 'Evidence readiness', 'Required documents', missing.length || unreadable.length ? 'UNRESOLVED' : 'PASS',
    missing.length ? `Missing ${missing.map(slot => SLOT_NAMES[slot]).join(', ')}.` : unreadable.length ? `Extract or review ${unreadable.map(slot => SLOT_NAMES[slot]).join(', ')} before checking completeness.` : 'All four required document types contain extractable information.',
    required.map(get), [], missing.length ? 'Upload the missing evidence.' : unreadable.length ? 'Resolve unreadable documents.' : 'Review the supporting declarations.');

  for (const slot of required) {
    const doc = get(slot); const id = val(doc, 'institutionId'); const ambiguous = facts(doc, 'institutionId').length > 1 && !id;
    add(`identity-${slot}`, 'Institution identity', `${SLOT_NAMES[slot]} identity`, !id ? 'UNRESOLVED' : id === normalize(application.institutionId) ? 'PASS' : 'DEFICIENCY',
      !id ? ambiguous ? 'Conflicting institution identifiers appear in this document.' : 'A readable institution identifier is required.' : id === normalize(application.institutionId) ? `${id} agrees with the synthetic institutional profile.` : `${id} differs from application identifier ${application.institutionId}.`,
      [doc], ref(doc, ['institutionId']), !id ? 'Check the original and confirm the identifier.' : id !== normalize(application.institutionId) ? 'Request evidence for the correct institution.' : 'Identity is consistent; source authenticity is separate.');
  }
  const cert = get('certificate'); const campus = val(cert, 'campus');
  add('campus-scope', 'Campus applicability', 'Certificate campus scope', !campus ? 'UNRESOLVED' : campus === normalize(application.campus) ? 'PASS' : 'DEFICIENCY',
    !campus ? 'The certificate does not establish an unambiguous campus.' : campus === normalize(application.campus) ? `The certificate names ${application.campus}, the campus under review.` : `The certificate names ${campus}, while this application concerns ${application.campus}. A genuine document can still cover different premises.`,
    [cert], ref(cert, ['campus', 'certificateId']), campus && campus !== normalize(application.campus) ? `Provide evidence covering ${application.campus}; the submitted certificate identifies ${campus}.` : !campus ? 'Confirm the campus from the original document.' : 'Review campus applicability.');
  for (const [slot, field, expected, title] of [
    ['application', 'period', application.period, 'Application academic year'],
    ['approval', 'approvalPeriod', application.previousPeriod, 'Previous approval period']
  ] as const) {
    const doc = get(slot); const actual = val(doc, field);
    add(`period-${slot}`, 'Period & validity', title, !actual ? 'UNRESOLVED' : actual === normalize(expected) ? 'PASS' : 'DEFICIENCY',
      !actual ? 'A readable, unambiguous academic period is required.' : actual === normalize(expected) ? slot === 'approval' ? `${expected} is the expected historical approval period, not a current-year certificate.` : `The application covers ${expected}.` : `${actual} differs from the expected ${expected}.`,
      [doc], ref(doc, [field]), actual === normalize(expected) ? 'Period is consistent with the demonstration checklist.' : 'Confirm the applicable academic period.');
  }
  const from = isoDate(val(cert, 'validFrom')); const until = isoDate(val(cert, 'validUntil'));
  const ambiguousDates = !from || !until; const impossible = !!from && !!until && from > until;
  const expired = !!until && until < application.referenceDate; const future = !!from && from > application.referenceDate;
  add('certificate-validity', 'Period & validity', 'Certificate validity', ambiguousDates ? 'UNRESOLVED' : impossible || expired || future ? 'DEFICIENCY' : 'PASS',
    ambiguousDates ? 'Use unambiguous YYYY-MM-DD validity dates; missing or ambiguous dates require manual review.' : impossible ? 'The validity end date precedes its start date.' : expired ? `The certificate expired on ${until}; the reference date is ${application.referenceDate}.` : future ? `The certificate starts on ${from}, after the reference date ${application.referenceDate}.` : `The stated validity ${from} to ${until} includes ${application.referenceDate}. This does not verify the issuer.`,
    [cert], ref(cert, ['validFrom', 'validUntil']), ambiguousDates || impossible || expired || future ? 'Request clarification of certificate validity.' : 'Dates are applicable; retain the original evidence.', [`reference:${application.referenceDate}`]);
  const applicationDoc = get('application'); const approval = get('approval');
  const declaredIntake = val(applicationDoc, 'intake'); const approvedIntake = val(approval, 'intake');
  const declaredCourse = val(applicationDoc, 'course'); const approvedCourse = val(approval, 'course');
  const intakeReady = !!declaredIntake && !!approvedIntake && /^\d+$/.test(declaredIntake) && /^\d+$/.test(approvedIntake) && !!declaredCourse && !!approvedCourse;
  const intakeMatch = intakeReady && Number(declaredIntake) === Number(approvedIntake) && declaredCourse === approvedCourse;
  add('historical-intake', 'Historical intake', 'Declared previous course & intake', !intakeReady ? 'UNRESOLVED' : intakeMatch ? 'PASS' : 'DEFICIENCY',
    !intakeReady ? 'Both documents need an unambiguous course and numeric historical intake.' : intakeMatch ? `${declaredCourse}: the declared historical intake of ${declaredIntake} matches previous approval.` : `Application: ${declaredCourse}, ${declaredIntake} seats. Previous approval: ${approvedCourse}, ${approvedIntake} seats.`,
    [applicationDoc, approval], [...ref(applicationDoc, ['course', 'intake']), ...ref(approval, ['course', 'intake'])], intakeMatch ? 'Historical declaration is consistent.' : 'Clarify the previously approved course and intake.');
  const certificateId = val(cert, 'certificateId');
  const mode = application.fixtureMode;
  const sourceStatus: Finding['sourceStatus'] = mode === 'UNAVAILABLE' ? 'SOURCE_UNAVAILABLE' : mode === 'MISMATCH' ? 'SIMULATED_MISMATCH' : 'SIMULATED_MATCH';
  add('source-verification', 'Source comparison', 'Issuing-source verification', 'UNRESOLVED',
    !certificateId ? 'A certificate identifier is needed before source comparison.' : mode === 'UNAVAILABLE' ? 'The simulated source is unavailable. This is not evidence of non-compliance.' : mode === 'MISMATCH' ? 'The simulated issuer response disagrees with submitted information. Obtain independent confirmation before any adverse action.' : 'The simulated issuer response matches the submitted identifier. Independent issuer verification has not been performed.',
    [cert], ref(cert, ['certificateId', 'issuer']), mode === 'UNAVAILABLE' ? 'Retry later or request manual source confirmation.' : 'Obtain confirmation through an authorized issuing source.', [`fixture:${mode}`], sourceStatus);
  const infra = get('infrastructure');
  add('infrastructure-readiness', 'Evidence readiness', 'Infrastructure evidence assessment', !infra ? 'UNRESOLVED' : infrastructure.outcome === 'REVIEWED' ? 'PASS' : 'UNRESOLVED',
    !infra ? 'No supporting infrastructure image is attached. A demonstration evidence slot remains open.' : infrastructure.outcome === 'REVIEWED' ? `A reviewer recorded an evidence assessment: ${infrastructure.note}. No physical compliance certification is implied.` : infrastructure.outcome === 'INSPECTION' ? `Physical inspection recommended: ${infrastructure.note}` : 'Supporting infrastructure evidence is attached and requires manual assessment. No floor-area or safety claim is inferred from an image.',
    [infra], [], !infra ? 'Attach supporting evidence or record why it is not applicable.' : 'Record a manual assessment or recommend inspection.', [`assessment:${infrastructure.outcome}:${infrastructure.note}`]);
  return rows;
}
