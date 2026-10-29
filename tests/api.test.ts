import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { once } from 'node:events';
import { createApp } from '../server/index.js';
import { CORRECTED_TEXT, SAMPLE_TEXT, makeSamplePDF } from '../server/seed.js';
import type { Impact, Snapshot } from '../shared/types.js';

test('real API and SQLite preserve evidence through the complete rectification journey', async t => {
  const root = await mkdtemp(join(tmpdir(), 'pramaan-test-'));
  const { app, store } = await createApp(root); const server = app.listen(0, '127.0.0.1'); await once(server, 'listening');
  const port = (server.address() as { port: number }).port; const base = `http://127.0.0.1:${port}`;
  const headers = { 'X-PramaanScope': 'local-demo', 'Content-Type': 'application/json' };
  const get = async () => await (await fetch(base + '/api/applications/PS-2026-0042')).json() as Snapshot;
  const post = (path: string, body: unknown, extra = {}) => fetch(base + path, { method: 'POST', headers: { ...headers, ...extra }, body: JSON.stringify(body) });
  const upload = async (bytes: Buffer, name: string, slot = 'certificate') => {
    const form = new FormData(); form.append('file', new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }), name); form.append('slot', slot); form.append('candidate', 'true'); form.append('reason', 'Correction covering the requested campus.');
    return fetch(base + '/api/applications/PS-2026-0042/documents', { method: 'POST', headers: { 'X-PramaanScope': 'local-demo' }, body: form });
  };
  try {
    let candidateId = ''; let originalId = ''; let historicalFingerprint = '';
    await t.test('seed PDFs are genuinely parsed and original bytes can be retrieved', async () => {
      const snapshot = await get(); assert.equal(snapshot.documents.length, 5);
      assert.ok(snapshot.documents.filter(doc => doc.mime === 'application/pdf').every(doc => doc.facts.length > 0));
      originalId = snapshot.documents.find(doc => doc.slot === 'certificate')!.id;
      historicalFingerprint = snapshot.findings.find(row => row.key === 'historical-intake')!.fingerprint;
      const response = await fetch(base + `/api/documents/${originalId}/file`); assert.equal(response.status, 200); assert.equal(Buffer.from(await response.arrayBuffer()).subarray(0, 5).toString(), '%PDF-');
      const preview = await fetch(base + `/api/documents/${originalId}/page/1`); assert.equal(preview.status, 200);
      assert.equal(Buffer.from(await preview.arrayBuffer()).subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    });
    await t.test('replacement is blocked without a clarification and original evidence remains active', async () => {
      assert.equal((await upload(makeSamplePDF('certificate', CORRECTED_TEXT), 'corrected.pdf')).status, 409);
      assert.equal((await get()).documents.find(doc => doc.id === originalId)!.state, 'ACTIVE');
    });
    await t.test('reviews retain current fingerprint; institution persona cannot record reviewer decisions', async () => {
      assert.equal((await post('/api/findings/campus-scope/reviews', { action: 'REVIEWED', note: 'Campus mismatch reviewed.' }, { 'X-Demo-Persona': 'INSTITUTION' })).status, 403);
      assert.equal((await post('/api/findings/campus-scope/reviews', { action: 'REVIEWED', note: 'The wrong-campus evidence was inspected.' })).status, 200);
      assert.equal((await post('/api/findings/campus-scope/reviews', { action: 'CLARIFICATION', note: 'Provide a certificate covering Campus A.' })).status, 200);
    });
    await t.test('upload creates a candidate without changing the active findings', async () => {
      const response = await upload(makeSamplePDF('certificate', CORRECTED_TEXT), 'corrected.pdf'); assert.equal(response.status, 201);
      const payload = await response.json(); candidateId = payload.document.id;
      assert.equal(payload.document.state, 'CANDIDATE'); assert.equal(payload.snapshot.findings.find((row: { key: string }) => row.key === 'campus-scope').status, 'DEFICIENCY');
    });
    await t.test('impact counts derive from actual dependencies and include prior reviews', async () => {
      const response = await fetch(base + `/api/documents/${candidateId}/impact`); const impact = await response.json() as Impact;
      assert.ok(impact.affected.length >= 4); assert.equal(impact.affectedReviews, 1);
      assert.equal(impact.changes.find(change => change.field === 'Campus')!.after, 'CAMPUS A');
      assert.ok(impact.unchanged.some(row => row.key === 'historical-intake'));
      assert.equal(impact.affected.find(row => row.before.key === 'campus-scope')!.after!.status, 'PASS');
    });
    await t.test('a changed application revision invalidates a previously displayed preview', async () => {
      const impact = await (await fetch(base + `/api/documents/${candidateId}/impact`)).json() as Impact;
      await post('/api/findings/identity-application/reviews', { action: 'REVIEWED', note: 'Institution identifier checked.' });
      assert.equal((await post(`/api/documents/${candidateId}/confirm`, { revision: impact.applicationRevision })).status, 409);
      assert.equal((await get()).documents.find(doc => doc.id === originalId)!.state, 'ACTIVE');
    });
    await t.test('accepting correction re-evaluates dependent evidence and preserves unaffected findings', async () => {
      const impact = await (await fetch(base + `/api/documents/${candidateId}/impact`)).json() as Impact;
      const response = await post(`/api/documents/${candidateId}/confirm`, { revision: impact.applicationRevision }); assert.equal(response.status, 200);
      const snapshot = await response.json() as Snapshot;
      assert.equal(snapshot.findings.find(row => row.key === 'campus-scope')!.status, 'PASS');
      assert.equal(snapshot.documents.find(doc => doc.id === originalId)!.state, 'SUPERSEDED');
      assert.equal(snapshot.documents.find(doc => doc.id === candidateId)!.state, 'ACTIVE');
      assert.equal(snapshot.findings.find(row => row.key === 'historical-intake')!.fingerprint, historicalFingerprint);
      const originalReview = snapshot.reviews.find(review => review.findingKey === 'campus-scope' && review.action === 'REVIEWED')!;
      assert.notEqual(originalReview.fingerprint, snapshot.findings.find(row => row.key === 'campus-scope')!.fingerprint);
      assert.equal((await fetch(base + `/api/documents/${originalId}/file`)).status, 200);
      assert.equal((await post(`/api/documents/${candidateId}/confirm`, { revision: snapshot.application.revision })).status, 409);
    });
    await t.test('simulated source outage stays unresolved and appears in source history', async () => {
      const response = await post('/api/applications/PS-2026-0042/source', { mode: 'UNAVAILABLE' }); const snapshot = await response.json() as Snapshot;
      assert.equal(snapshot.findings.find(row => row.key === 'source-verification')!.status, 'UNRESOLVED');
      assert.equal(snapshot.sourceAttempts.at(-1)!.mode, 'SIMULATED');
      assert.equal(snapshot.sourceAttempts.at(-1)!.outcome, 'UNAVAILABLE');
    });
    await t.test('invalid files and cross-origin writes are rejected', async () => {
      await post('/api/findings/campus-scope/reviews', { action: 'CLARIFICATION', note: 'Test a replacement with correct file validation.' });
      assert.equal((await upload(Buffer.from('not a PDF'), 'pretend.pdf')).status, 400);
      assert.equal((await post('/api/applications/PS-2026-0042/source', { mode: 'MATCH' }, { Origin: 'https://untrusted.example' })).status, 403);
      assert.equal((await post('/api/applications/PS-2026-0042/source', { mode: 'MISSING' })).status, 400);
      assert.equal((await fetch(base + '/api/applications/OTHER')).status, 404);
    });
    await t.test('export is a real PDF containing report pages', async () => {
      const response = await fetch(base + '/api/applications/PS-2026-0042/report'); assert.match(response.headers.get('content-type')!, /application\/pdf/);
      assert.equal(Buffer.from(await response.arrayBuffer()).subarray(0, 5).toString(), '%PDF-');
    });
    await t.test('reset returns all seeded document versions to one', async () => {
      const response = await post('/api/demo/reset', { confirmation: 'RESET SYNTHETIC DEMO' }); const snapshot = await response.json() as Snapshot;
      assert.ok(snapshot.documents.every(doc => doc.version === 1)); assert.equal(snapshot.reviews.length, 0); assert.equal(snapshot.clarifications.length, 0);
    });
    await t.test('review completion requires every current finding and retains unresolved verification', async () => {
      assert.equal((await post('/api/applications/PS-2026-0042/complete-review', {})).status, 409);
      for (const finding of (await get()).findings) await post(`/api/findings/${finding.key}/reviews`, { action: 'REVIEWED', note: 'Reviewed as a synthetic test; outstanding limitations remain.' });
      const response = await post('/api/applications/PS-2026-0042/complete-review', {}); assert.equal(response.status, 200);
      const snapshot = await response.json() as Snapshot; assert.equal(snapshot.application.workflow, 'REVIEW_COMPLETE');
      assert.equal(snapshot.findings.find(row => row.key === 'source-verification')!.status, 'UNRESOLVED');
    });
  } finally {
    await new Promise<void>(resolveClose => server.close(() => resolveClose())); store.close();
    const absolute = resolve(root); if (!absolute.startsWith(resolve(tmpdir()) + sep) || !absolute.includes('pramaan-test-')) throw new Error('Unexpected temporary test directory.');
    await rm(absolute, { recursive: true, force: true });
  }
});
