import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluate, isoDate, parseFacts } from '../server/rules.js';
import { BASE_APPLICATION, SAMPLE_TEXT } from '../server/seed.js';
import { SLOT_NAMES, type DocumentVersion, type Slot } from '../shared/types.js';

function fixtures(): DocumentVersion[] {
  return (Object.keys(SAMPLE_TEXT) as (keyof typeof SAMPLE_TEXT)[]).map(slot => ({
    id: `${slot}-v1`, slot, version: 1, name: `${slot}.pdf`, mime: 'application/pdf', hash: 'test-hash', size: 100,
    state: 'ACTIVE', status: 'READY', error: '', createdAt: '2026-10-27T00:00:00Z', previousId: null, reason: '',
    pages: [{ page: 1, text: SAMPLE_TEXT[slot].join('\n') }], facts: parseFacts([{ page: 1, text: SAMPLE_TEXT[slot].join('\n') }], 'PDF_TEXT')
  }));
}
const infra = { outcome: 'PENDING', note: '' };
function result(docs = fixtures(), app = BASE_APPLICATION) { return evaluate(app, docs, infra); }
function set(docs: DocumentVersion[], slot: Slot, field: string, value: string) { docs.find(doc => doc.slot === slot)!.facts.filter(fact => fact.field === field).forEach(fact => { fact.value = value; fact.raw = `${field}: ${value}`; }); }

test('wrong-campus evidence is a scope discrepancy, not an authenticity conclusion', () => {
  const rows = result(); const campus = rows.find(row => row.key === 'campus-scope')!;
  assert.equal(campus.status, 'DEFICIENCY'); assert.match(campus.evidence[0].quote, /CAMPUS B/);
  assert.equal(rows.find(row => row.key === 'identity-certificate')!.status, 'PASS');
  assert.equal(rows.find(row => row.key === 'source-verification')!.status, 'UNRESOLVED');
});
test('a correct campus changes content status while issuer confirmation stays unresolved', () => {
  const docs = fixtures(); set(docs, 'certificate', 'campus', 'Campus A');
  assert.equal(result(docs).find(row => row.key === 'campus-scope')!.status, 'PASS');
  assert.equal(result(docs).find(row => row.key === 'source-verification')!.status, 'UNRESOLVED');
});
test('different institution identifiers are flagged with source evidence', () => {
  const docs = fixtures(); set(docs, 'certificate', 'institutionId', 'OTHER-099');
  const finding = result(docs).find(row => row.key === 'identity-certificate')!;
  assert.equal(finding.status, 'DEFICIENCY'); assert.match(finding.reason, /OTHER-099/); assert.equal(finding.evidence[0].documentId, 'certificate-v1');
});
test('conflicting identifiers within a document cannot silently choose the first value', () => {
  const docs = fixtures(); docs[0].facts.push({ field: 'institutionId', value: 'OTHER', raw: 'Institution ID: OTHER', page: 2, method: 'PDF_TEXT' });
  assert.equal(result(docs).find(row => row.key === 'identity-application')!.status, 'UNRESOLVED');
});
test('historical approval is not incorrectly treated as an expired current approval', () => {
  assert.equal(result().find(row => row.key === 'period-approval')!.status, 'PASS');
});
test('validity distinguishes expired, future, impossible, and ambiguous dates', () => {
  for (const [from, until, status] of [
    ['2026-01-01', '2026-10-26', 'DEFICIENCY'], ['2027-01-01', '2027-12-31', 'DEFICIENCY'],
    ['2026-10-28', '2026-10-01', 'DEFICIENCY'], ['01/02/2026', '2027-12-31', 'UNRESOLVED'],
    ['2026-02-30', '2027-12-31', 'UNRESOLVED'], ['2026-01-01', '2026-10-27', 'PASS']
  ]) { const docs = fixtures(); set(docs, 'certificate', 'validFrom', from); set(docs, 'certificate', 'validUntil', until); assert.equal(result(docs).find(row => row.key === 'certificate-validity')!.status, status); }
  assert.equal(isoDate('2024-02-29'), '2024-02-29'); assert.equal(isoDate('2026-02-29'), null);
});
test('historical intake comparison requires both matching course and numeric intake', () => {
  const docs = fixtures(); set(docs, 'approval', 'intake', '120');
  assert.equal(result(docs).find(row => row.key === 'historical-intake')!.status, 'DEFICIENCY');
  set(docs, 'approval', 'intake', 'unclear'); assert.equal(result(docs).find(row => row.key === 'historical-intake')!.status, 'UNRESOLVED');
});
test('source outages and synthetic mismatches never establish a statutory deficiency', () => {
  for (const fixtureMode of ['MATCH', 'MISMATCH', 'UNAVAILABLE'] as const) {
    const source = result(fixtures(), { ...BASE_APPLICATION, fixtureMode }).find(row => row.key === 'source-verification')!;
    assert.equal(source.status, 'UNRESOLVED'); assert.match(source.reason.toLowerCase(), /simulated/);
  }
});
test('missing and unreadable evidence stay unresolved rather than getting a false pass', () => {
  const docs = fixtures(); docs[0].status = 'ERROR'; docs[0].facts = [];
  assert.equal(result(docs).find(row => row.key === 'completeness')!.status, 'UNRESOLVED');
  assert.equal(result(docs.filter(doc => doc.slot !== 'certificate')).find(row => row.key === 'campus-scope')!.status, 'UNRESOLVED');
});
test('byte-version identity changes the dependent fingerprints, preserving unrelated ones', () => {
  const docs = fixtures(); const before = result(docs); docs.find(doc => doc.slot === 'certificate')!.id = 'certificate-v2';
  const after = result(docs);
  assert.notEqual(before.find(row => row.key === 'campus-scope')!.fingerprint, after.find(row => row.key === 'campus-scope')!.fingerprint);
  assert.equal(before.find(row => row.key === 'historical-intake')!.fingerprint, after.find(row => row.key === 'historical-intake')!.fingerprint);
});
test('extraction preserves page attribution and repeated assertions', () => {
  const facts = parseFacts([{ page: 2, text: 'Institution ID: PIT-042\nCampus: CAMPUS A\nCampus: CAMPUS B' }], 'LOCAL_OCR');
  assert.equal(facts.filter(fact => fact.field === 'campus').length, 2); assert.ok(facts.every(fact => fact.page === 2 && fact.method === 'LOCAL_OCR'));
});
