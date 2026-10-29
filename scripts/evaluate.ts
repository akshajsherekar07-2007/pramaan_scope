import { mkdir, writeFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import { BASE_APPLICATION, SAMPLE_TEXT, makeSamplePDF } from '../server/seed.js';
import { evaluate } from '../server/rules.js';
import { extractPdf } from '../server/documents.js';
import type { Application, DocumentVersion, Slot, Status } from '../shared/types.js';

type Case = { name: string; check: string; expected: Status; slot?: keyof typeof SAMPLE_TEXT; from?: string; to?: string; missing?: Slot; source?: Application['fixtureMode'] };
const cases: Case[] = [
  { name: 'Wrong campus', check: 'campus-scope', expected: 'DEFICIENCY' },
  { name: 'Correct campus', slot: 'certificate', from: 'Campus: CAMPUS B', to: 'Campus: CAMPUS A', check: 'campus-scope', expected: 'PASS' },
  { name: 'Different institution', slot: 'certificate', from: 'Institution ID: PIT-042', to: 'Institution ID: OTHER-099', check: 'identity-certificate', expected: 'DEFICIENCY' },
  { name: 'Expired certificate', slot: 'certificate', from: 'Valid Until: 2027-12-31', to: 'Valid Until: 2026-01-02', check: 'certificate-validity', expected: 'DEFICIENCY' },
  { name: 'Ambiguous date', slot: 'certificate', from: 'Valid From: 2026-01-01', to: 'Valid From: 01/02/2026', check: 'certificate-validity', expected: 'UNRESOLVED' },
  { name: 'Impossible date', slot: 'certificate', from: 'Valid From: 2026-01-01', to: 'Valid From: 2026-02-30', check: 'certificate-validity', expected: 'UNRESOLVED' },
  { name: 'Historical approval', check: 'period-approval', expected: 'PASS' },
  { name: 'Wrong approval period', slot: 'approval', from: 'Approval Period: 2025-26', to: 'Approval Period: 2023-24', check: 'period-approval', expected: 'DEFICIENCY' },
  { name: 'Historical intake mismatch', slot: 'approval', from: 'Approved Intake: 60', to: 'Approved Intake: 120', check: 'historical-intake', expected: 'DEFICIENCY' },
  { name: 'Missing certificate', missing: 'certificate', check: 'completeness', expected: 'UNRESOLVED' },
  { name: 'Source unavailable', source: 'UNAVAILABLE', check: 'source-verification', expected: 'UNRESOLVED' },
  { name: 'Simulated source match', source: 'MATCH', check: 'source-verification', expected: 'UNRESOLVED' }
];
const results = [];
for (const scenario of cases) {
  const started = performance.now(); const docs: DocumentVersion[] = [];
  for (const slot of Object.keys(SAMPLE_TEXT) as (keyof typeof SAMPLE_TEXT)[]) {
    if (scenario.missing === slot) continue;
    const lines = SAMPLE_TEXT[slot].map(line => scenario.slot === slot && line === scenario.from ? scenario.to! : line);
    const original = makeSamplePDF(slot, lines); const extracted = await extractPdf(original);
    docs.push({ id: slot + '-v1', slot, version: 1, name: `${slot}.pdf`, mime: 'application/pdf', hash: 'evaluation-only', size: original.length, state: 'ACTIVE', error: '', createdAt: new Date().toISOString(), previousId: null, reason: 'Synthetic evaluation', ...extracted });
  }
  const row = evaluate({ ...BASE_APPLICATION, fixtureMode: scenario.source || 'MATCH' }, docs, { outcome: 'PENDING', note: '' }).find(finding => finding.key === scenario.check)!;
  results.push({ scenario: scenario.name, check: scenario.check, expected: scenario.expected, observed: row.status, passed: scenario.expected === row.status, elapsedMs: Math.round((performance.now() - started) * 10) / 10 });
}
await mkdir('submission', { recursive: true });
const report = { generatedAt: new Date().toISOString(), scope: '12 deterministic synthetic packet cases, actual PDF generation and text extraction. Not real-world accuracy, a held-out benchmark, or an officer time-saving study.', results };
await writeFile('submission/evaluation-results.json', JSON.stringify(report, null, 2));
await writeFile('submission/evaluation-results.csv', 'Scenario,Check,Expected,Observed,Pass,PDF-processing-ms\n' + results.map(row => [row.scenario, row.check, row.expected, row.observed, row.passed, row.elapsedMs].join(',')).join('\n'));
console.table(results);
if (results.some(row => !row.passed)) process.exitCode = 1;
