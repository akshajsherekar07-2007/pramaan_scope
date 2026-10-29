import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { once } from 'node:events';
import { createApp } from '../server/index.js';
import { APP_ID, type AccessSession, type Snapshot, type Impact } from '../shared/types.js';
import { CORRECTED_TEXT, makeSamplePDF } from '../server/seed.js';

test('protected workspace enforces identity, session lifecycle, scope, and private review data', async t => {
  const root = await mkdtemp(join(tmpdir(), 'pramaan-auth-'));
  let clock = Date.now(); const result = await createApp(root, { mode: 'pilot', clock: () => clock });
  const { store } = result; let activeStore = store; let server = result.app.listen(0, '127.0.0.1'); await once(server, 'listening');
  const port = (server.address() as { port: number }).port; const base = `http://127.0.0.1:${port}`;
  const path = `/api/applications/${APP_ID}`; const common = { 'X-PramaanScope': 'local-demo', 'Content-Type': 'application/json', Connection: 'close' };
  type Client = { cookie: string; csrf: string };
  const reviewer: Client = { cookie: '', csrf: '' }, institution: Client = { cookie: '', csrf: '' };
  const get = (url: string, client?: Client) => fetch(base + url, { headers: { Connection: 'close', ...(client ? { Cookie: client.cookie } : {}) } });
  const post = (url: string, body: unknown, client?: Client, extra: Record<string, string> = {}) => fetch(base + url, { method: 'POST', headers: { ...common, ...(client ? { Cookie: client.cookie, 'X-CSRF-Token': client.csrf } : {}), ...extra }, body: JSON.stringify(body) });
  async function signedIn(response: Response, client: Client) { assert.ok(response.ok, await response.clone().text()); const session = await response.json() as AccessSession; client.cookie = response.headers.get('set-cookie')!.split(';')[0]; client.csrf = session.csrf; return session; }
  let reviewerId = '', institutionId = '', candidateId = '', originalId = '';
  const reviewerPassword = 'abcdef'; const institutionPassword = 'ghijkl';
  try {
    await t.test('unauthenticated APIs, originals, reports, uploads and history are protected', async () => {
      assert.equal((await get('/api/health')).status, 200);
      for (const url of [path, path + '/report', path + '/history', '/api/documents/unknown/file', '/api/documents/unknown/page/1', '/api/auth/users', '/api/demo/samples/certificate.pdf']) assert.equal((await get(url)).status, 401, url);
      assert.equal((await post(path + '/documents', {})).status, 401);
      assert.equal((await get('/api/auth/session')).status, 200);
    });
    await t.test('first reviewer needs six password characters and no setup key', async () => {
      const body = { username: 'reviewer@example.com', name: 'Pilot reviewer', password: reviewerPassword };
      assert.equal((await post('/api/auth/setup', { ...body, password: 'abcde' })).status, 400);
      const response = await post('/api/auth/setup', body); assert.equal(response.status, 201);
      const cookie = response.headers.get('set-cookie')!; assert.match(cookie, /HttpOnly/); assert.match(cookie, /SameSite=Strict/); assert.match(cookie, /Max-Age=28800/);
      const session = await signedIn(response, reviewer); assert.equal(session.user!.role, 'REVIEWER'); assert.equal(session.user!.username, 'reviewer@example.com'); reviewerId = session.user!.id;
      assert.equal(session.setupRequired, false); assert.ok(session.csrf.length >= 64);
      assert.equal((await post('/api/auth/setup', body)).status, 409);
    });
    await t.test('passwords are salted scrypt hashes and raw session tokens are not stored', () => {
      const row = store.db.prepare('SELECT password_hash FROM auth_users WHERE id=?').get(reviewerId) as { password_hash: string };
      assert.match(row.password_hash, /^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/); assert.ok(!row.password_hash.includes(reviewerPassword));
      const sessions = store.db.prepare('SELECT token_hash FROM auth_sessions').all() as { token_hash: string }[];
      assert.ok(sessions.length); assert.notEqual(sessions[0].token_hash, reviewer.cookie.split('=')[1]);
    });
    await t.test('authenticated mutations reject missing CSRF and foreign origins', async () => {
      assert.equal((await post(path + '/analyse', {}, reviewer, { 'X-CSRF-Token': '' })).status, 403);
      assert.equal((await post(path + '/analyse', {}, reviewer, { Origin: 'https://unrelated.example' })).status, 403);
      assert.equal((await post(path + '/analyse', {}, reviewer)).status, 200);
      assert.equal((await post('/api/demo/reset', { confirmation: 'RESET SYNTHETIC DEMO' }, reviewer)).status, 403);
    });
    await t.test('reviewer provisions only application-bound institution accounts', async () => {
      const user = await (await post('/api/auth/users', { username: 'institution@example.com', name: 'Campus office', password: institutionPassword, role: 'REVIEWER', applicationId: 'OTHER' }, reviewer)).json();
      assert.equal(user.role, 'INSTITUTION'); assert.equal(user.applicationId, APP_ID); institutionId = user.id;
      assert.ok(institutionId);
      assert.equal((await post('/api/auth/users', { username: 'institution@example.com', name: 'Duplicate', password: institutionPassword }, reviewer)).status, 409);
      const users = await (await get('/api/auth/users', reviewer)).json(); assert.equal(users.length, 2); assert.ok(users.every((item: object) => !('password_hash' in item)));
    });
    await t.test('spoofed persona headers cannot elevate an institution account', async () => {
      await signedIn(await post('/api/auth/login', { username: 'institution@example.com', password: institutionPassword }), institution);
      const attempts: [string, unknown][] = [
        ['/api/findings/campus-scope/reviews', { action: 'REVIEWED', note: 'Cannot elevate.' }],
        [path + '/analyse', {}], [path + '/source', { mode: 'MATCH' }], [path + '/infrastructure', { outcome: 'REVIEWED', note: 'Cannot elevate.' }],
        [path + '/complete-review', {}], ['/api/auth/users', { username: 'newreviewer', name: 'Impersonator', password: reviewerPassword }],
        ['/api/auth/users/' + reviewerId + '/disable', {}],
      ];
      for (const [url, body] of attempts) assert.equal((await post(url, body, institution, { 'X-Demo-Persona': 'REVIEWER' })).status, 403, url);
      for (const url of [path + '/report', path + '/history', '/api/auth/users']) assert.equal((await get(url, institution)).status, 403, url);
    });
    await t.test('private reviewer notes remain private while clarification and review status are visible', async () => {
      await post('/api/findings/campus-scope/reviews', { action: 'REVIEWED', note: 'PRIVATE REVIEWER NOTE 983.' }, reviewer);
      await post('/api/findings/campus-scope/reviews', { action: 'CLARIFICATION', note: 'Provide the Campus A certificate.' }, reviewer);
      await post(path + '/infrastructure', { outcome: 'REVIEWED', note: 'PRIVATE INFRASTRUCTURE NOTE 521.' }, reviewer);
      const snapshot = await (await get(path, institution)).json() as Snapshot;
      assert.equal(snapshot.reviewVisibility, 'STATUS_ONLY'); assert.ok(snapshot.reviews.length); assert.ok(snapshot.reviews.every(row => row.note === '' && row.actor === 'Review team'));
      assert.ok(snapshot.clarifications.some(row => row.note.includes('Campus A'))); assert.equal(snapshot.events.length, 0); assert.equal(snapshot.infrastructure.note, '');
      assert.ok(!JSON.stringify(snapshot).includes('PRIVATE')); originalId = snapshot.documents.find(row => row.slot === 'certificate' && row.state === 'ACTIVE')!.id;
      const reviewerView = await (await get(path, reviewer)).json() as Snapshot;
      assert.ok(reviewerView.reviews.some(row => row.note.includes('PRIVATE REVIEWER'))); assert.match(reviewerView.reviews[0].actor, new RegExp(reviewerId));
    });
    await t.test('institution submits a permitted candidate with redacted response and cannot accept it', async () => {
      const form = new FormData(); form.append('file', new Blob([new Uint8Array(makeSamplePDF('certificate', CORRECTED_TEXT))]), 'corrected.pdf'); form.append('slot', 'certificate'); form.append('candidate', 'true'); form.append('reason', 'Requested Campus A correction.');
      const response = await fetch(base + path + '/documents', { method: 'POST', headers: { 'X-PramaanScope': 'local-demo', Cookie: institution.cookie, 'X-CSRF-Token': institution.csrf }, body: form }); assert.equal(response.status, 201);
      const body = await response.json(); candidateId = body.document.id; assert.ok(!JSON.stringify(body).includes('PRIVATE'));
      const impact = await (await get(`/api/documents/${candidateId}/impact`, institution)).json() as Impact; assert.equal(impact.affectedReviews, 0); assert.ok(impact.affected.every(row => row.reviews === 0)); assert.ok(!JSON.stringify(impact).includes('PRIVATE'));
      assert.equal((await post(`/api/documents/${candidateId}/confirm`, { revision: impact.applicationRevision }, institution)).status, 403);
      const reviewerImpact = await (await get(`/api/documents/${candidateId}/impact`, reviewer)).json() as Impact; assert.ok(reviewerImpact.affectedReviews > 0);
      assert.equal((await post(`/api/documents/${candidateId}/confirm`, { revision: reviewerImpact.applicationRevision }, reviewer)).status, 200);
      const snapshot = await (await get(path, reviewer)).json() as Snapshot; assert.ok(snapshot.events.some(row => row.type === 'REPLACEMENT_PROPOSED' && row.actor.includes(institutionId)));
    });
    await t.test('application scope guards document IDs as well as application URLs', async () => {
      store.db.prepare('UPDATE auth_users SET applicationId=? WHERE id=?').run('UNASSIGNED', institutionId);
      for (const url of [path, `/api/documents/${originalId}/file`, `/api/documents/${candidateId}/impact`, '/api/demo/samples/certificate.pdf']) assert.equal((await get(url, institution)).status, 403, url);
      store.db.prepare('UPDATE auth_users SET applicationId=? WHERE id=?').run(APP_ID, institutionId);
      assert.equal((await get(`/api/documents/${originalId}/file`, institution)).status, 200);
    });
    await t.test('login errors are generic and repeated failures are throttled', async () => {
      const existing = await post('/api/auth/login', { username: 'reviewer@example.com', password: 'wrong password' });
      const missing = await post('/api/auth/login', { username: 'nonexistent', password: 'wrong password' });
      assert.equal(existing.status, 401); assert.deepEqual(await existing.json(), await missing.json());
      for (let i = 0; i < 4; i++) assert.equal((await post('/api/auth/login', { username: 'nonexistent', password: 'wrong password' })).status, 401);
      assert.equal((await post('/api/auth/login', { username: 'nonexistent', password: 'wrong password' })).status, 429);
    });
    await t.test('logout revokes the server session and subsequent login rotates its token', async () => {
      const old = { ...institution }; assert.equal((await post('/api/auth/logout', {}, institution)).status, 200);
      assert.equal((await get(path, old)).status, 401);
      await signedIn(await post('/api/auth/login', { username: 'institution@example.com', password: institutionPassword }), institution); assert.notEqual(institution.cookie, old.cookie);
    });
    await t.test('disabling an institution revokes every active session', async () => {
      assert.equal((await post(`/api/auth/users/${institutionId}/disable`, {}, reviewer)).status, 200);
      assert.equal((await get(path, institution)).status, 401);
      assert.equal((await post('/api/auth/login', { username: 'institution@example.com', password: institutionPassword })).status, 401);
    });
    await t.test('sessions expire after inactivity', async () => {
      clock += 31 * 60_000; assert.equal((await get(path, reviewer)).status, 401);
      await signedIn(await post('/api/auth/login', { username: 'reviewer@example.com', password: reviewerPassword }), reviewer);
      assert.equal((await get(path, reviewer)).status, 200);
    });
    await t.test('active traffic cannot extend the absolute eight-hour session lifetime', async () => {
      for (let i = 0; i < 23; i++) { clock += 20 * 60_000; assert.equal((await get(path, reviewer)).status, 200); }
      clock += 20 * 60_000; assert.equal((await get(path, reviewer)).status, 401);
    });
    await t.test('accounts and sessions survive server restart on the same local port', async () => {
      await signedIn(await post('/api/auth/login', { username: 'reviewer@example.com', password: reviewerPassword }), reviewer);
      await new Promise<void>(done => server.close(() => done())); store.close();
      const reopened = await createApp(root, { mode: 'pilot', clock: () => clock });
      activeStore = reopened.store;
      server = reopened.app.listen(port, '127.0.0.1'); await once(server, 'listening');
      assert.equal((await get(path, reviewer)).status, 200); assert.equal((await (await get('/api/auth/session', reviewer)).json()).setupRequired, false);
      await new Promise<void>(done => server.close(() => done())); reopened.store.close();
    });
  } finally {
    if (server.listening) { await new Promise<void>(done => server.close(() => done())); activeStore.close(); }
    const absolute = resolve(root); if (!absolute.startsWith(resolve(tmpdir()) + sep) || !absolute.includes('pramaan-auth-')) throw new Error('Unexpected temporary auth directory.');
    await rm(absolute, { recursive: true, force: true });
  }
});
