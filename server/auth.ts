import { createHash, randomBytes, randomUUID, scrypt, timingSafeEqual } from 'node:crypto';
import { unlinkSync } from 'node:fs';
import { join } from 'node:path';
import type { DatabaseSync } from 'node:sqlite';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { APP_ID, type Account, type AccessSession } from '../shared/types.js';
import { HttpError } from './store.js';

export const accountInput = z.object({
  username: z.string().trim().toLowerCase().min(3, 'Use at least 3 characters.').max(100, 'Use no more than 100 characters.'),
  name: z.string().trim().min(2).max(100),
  password: z.string().min(6, 'Use at least 6 characters.').max(128),
});
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const safeEqual = (a: string, b: string) => { const x = Buffer.from(a); const y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); };
const IDLE_MS = 30 * 60_000, ABSOLUTE_MS = 8 * 60 * 60_000, WINDOW_MS = 15 * 60_000;
type UserRow = Account & { password_hash: string; enabled: number; };
type SessionRow = { token_hash: string; csrf: string; created_at: number; touched_at: number; user_id: string; };
export interface Identity { user: Account; csrf: string; tokenHash: string; expiresAt: number; }

// Async scrypt keeps password work off the request event loop; concurrency is bounded below.
const derive = (password: string, salt: string) => new Promise<Buffer>((resolve, reject) => {
  scrypt(password, salt, 64, { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 }, (error, key) => error ? reject(error) : resolve(key));
});
async function encodePassword(password: string) { const salt = randomBytes(16).toString('hex'); return `scrypt$${salt}$${(await derive(password, salt)).toString('hex')}`; }

export class Auth {
  private busy = 0;
  constructor(private db: DatabaseSync, root: string, private clock = Date.now) {
    db.exec(`CREATE TABLE IF NOT EXISTS auth_users (id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, name TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('REVIEWER','INSTITUTION')), applicationId TEXT NOT NULL, password_hash TEXT NOT NULL, enabled INTEGER NOT NULL DEFAULT 1);
      CREATE TABLE IF NOT EXISTS auth_sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES auth_users(id), csrf TEXT NOT NULL, created_at INTEGER NOT NULL, touched_at INTEGER NOT NULL);
      CREATE INDEX IF NOT EXISTS auth_session_user ON auth_sessions(user_id);
      CREATE TABLE IF NOT EXISTS auth_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, until_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS auth_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);`);
    // Local prototype setup no longer uses a first-run key. Remove legacy setup
    // state so an earlier failed attempt cannot keep the first reviewer locked out.
    db.prepare("DELETE FROM auth_meta WHERE key='bootstrap'").run();
    db.prepare("DELETE FROM auth_limits WHERE key='bootstrap'").run();
    try { unlinkSync(join(root, 'first-run-token.txt')); } catch { /* Legacy file may not exist. */ }
  }
  needsSetup() { return !this.db.prepare('SELECT id FROM auth_users LIMIT 1').get(); }
  private publicUser(row: UserRow): Account { return { id: row.id, username: row.username, name: row.name, role: row.role, applicationId: row.applicationId }; }
  private cookieName(req: Request) { return `pramaan_session_${req.socket.localPort || 'local'}`; }
  private cookie(req: Request) { const prefix = this.cookieName(req) + '='; return req.headers.cookie?.split(';').map(value => value.trim()).find(value => value.startsWith(prefix))?.slice(prefix.length) || ''; }
  private setCookie(req: Request, res: Response, token: string, maxAge = ABSOLUTE_MS / 1000) {
    // This server binds only to HTTP loopback. A remotely hosted pilot must use HTTPS + Secure cookies.
    res.setHeader('Set-Cookie', `${this.cookieName(req)}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}`);
  }
  resolve(req: Request): Identity | null {
    const token = this.cookie(req); if (!/^[a-f0-9]{64}$/.test(token)) return null;
    const tokenHash = hash(token); const session = this.db.prepare('SELECT * FROM auth_sessions WHERE token_hash=?').get(tokenHash) as SessionRow | undefined;
    if (!session) return null;
    const now = this.clock();
    const row = this.db.prepare('SELECT * FROM auth_users WHERE id=? AND enabled=1').get(session.user_id) as UserRow | undefined;
    if (!row || now - session.created_at >= ABSOLUTE_MS || now - session.touched_at >= IDLE_MS) { this.db.prepare('DELETE FROM auth_sessions WHERE token_hash=?').run(tokenHash); return null; }
    if (now - session.touched_at >= 60_000) this.db.prepare('UPDATE auth_sessions SET touched_at=? WHERE token_hash=?').run(now, tokenHash);
    return { user: this.publicUser(row), csrf: session.csrf, tokenHash, expiresAt: session.created_at + ABSOLUTE_MS };
  }
  session(identity: Identity | null): AccessSession { return { mode: 'pilot', setupRequired: this.needsSetup(), user: identity?.user || null, csrf: identity?.csrf || '', expiresAt: identity?.expiresAt || null }; }
  requireCsrf(req: Request, identity: Identity) { if (!safeEqual(String(req.headers['x-csrf-token'] || ''), identity.csrf)) throw new HttpError(403, 'Your session could not verify this request. Reload and try again.'); }
  private checkLimit(key: string, maximum: number) {
    const now = this.clock();
    this.db.prepare('DELETE FROM auth_limits WHERE until_at<=?').run(now);
    const row = this.db.prepare('SELECT count FROM auth_limits WHERE key=?').get(key) as { count: number } | undefined;
    if (row && row.count >= maximum) throw new HttpError(429, 'Too many sign-in attempts. Try again in 15 minutes.');
    this.db.prepare('INSERT INTO auth_limits(key,count,until_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1').run(key, now + WINDOW_MS);
  }
  private async passwordWork<T>(work: () => Promise<T>) { if (this.busy >= 2) throw new HttpError(429, 'Sign-in is busy. Please retry shortly.'); this.busy++; try { return await work(); } finally { this.busy--; } }
  private establish(req: Request, res: Response, user: Account) {
    const now = this.clock(); const token = randomBytes(32).toString('hex'); const csrf = randomBytes(32).toString('hex');
    this.db.exec('BEGIN IMMEDIATE');
    try {
      this.db.prepare('DELETE FROM auth_sessions WHERE token_hash=? OR created_at<=? OR touched_at<=?').run(hash(this.cookie(req)), now - ABSOLUTE_MS, now - IDLE_MS);
      this.db.prepare('INSERT INTO auth_sessions(token_hash,user_id,csrf,created_at,touched_at) VALUES(?,?,?,?,?)').run(hash(token), user.id, csrf, now, now);
      this.db.exec('COMMIT');
    } catch (error) { this.db.exec('ROLLBACK'); throw error; }
    this.setCookie(req, res, token);
    return this.session({ user, csrf, tokenHash: hash(token), expiresAt: now + ABSOLUTE_MS });
  }
  async bootstrap(req: Request, res: Response, input: unknown) {
    const body = accountInput.parse(input);
    if (!this.needsSetup()) throw new HttpError(409, 'Setup has already been completed. Sign in instead.');
    const passwordHash = await this.passwordWork(() => encodePassword(body.password));
    this.db.exec('BEGIN IMMEDIATE');
    let user: Account;
    try {
      if (!this.needsSetup()) throw new HttpError(409, 'Setup has already been completed. Sign in instead.');
      user = this.insertUser(body, 'REVIEWER', passwordHash); this.db.exec('COMMIT');
    } catch (error) { this.db.exec('ROLLBACK'); throw error; }
    return this.establish(req, res, user);
  }
  private insertUser(body: z.infer<typeof accountInput>, role: Account['role'], passwordHash: string) {
    const user: Account = { id: randomUUID(), username: body.username, name: body.name, role, applicationId: APP_ID };
    if (this.db.prepare('SELECT id FROM auth_users WHERE username=?').get(user.username)) throw new HttpError(409, 'This username is already assigned.');
    this.db.prepare('INSERT INTO auth_users(id,username,name,role,applicationId,password_hash) VALUES(?,?,?,?,?,?)').run(user.id, user.username, user.name, user.role, user.applicationId, passwordHash); return user;
  }
  async login(req: Request, res: Response, input: unknown) {
    const { username, password } = z.object({ username: z.string().trim().toLowerCase().max(100), password: z.string().max(128) }).parse(input);
    this.checkLimit('login-global', 25); this.checkLimit('login:' + hash(username), 5);
    const row = this.db.prepare('SELECT * FROM auth_users WHERE username=?').get(username) as UserRow | undefined;
    const [, salt, expected] = row?.password_hash.split('$') || ['scrypt', '0'.repeat(32), '0'.repeat(128)];
    const actual = await this.passwordWork(() => derive(password, salt));
    if (!row?.enabled || !safeEqual(actual.toString('hex'), expected)) throw new HttpError(401, 'Username or password is incorrect.');
    this.db.prepare('DELETE FROM auth_limits WHERE key=?').run('login:' + hash(username));
    return this.establish(req, res, this.publicUser(row));
  }
  logout(req: Request, res: Response, identity: Identity) { this.db.prepare('DELETE FROM auth_sessions WHERE token_hash=?').run(identity.tokenHash); this.setCookie(req, res, '', 0); }
  listUsers() { return (this.db.prepare('SELECT * FROM auth_users ORDER BY username').all() as unknown as UserRow[]).map(row => ({ ...this.publicUser(row), enabled: !!row.enabled })); }
  async createInstitution(input: unknown) { const body = accountInput.parse(input); const encoded = await this.passwordWork(() => encodePassword(body.password)); return this.insertUser(body, 'INSTITUTION', encoded); }
  disableInstitution(id: string) {
    const row = this.db.prepare("SELECT * FROM auth_users WHERE id=? AND role='INSTITUTION'").get(id) as UserRow | undefined;
    if (!row) throw new HttpError(404, 'Institution account not found.');
    this.db.exec('BEGIN IMMEDIATE'); try { this.db.prepare('UPDATE auth_users SET enabled=0 WHERE id=?').run(id); this.db.prepare('DELETE FROM auth_sessions WHERE user_id=?').run(id); this.db.exec('COMMIT'); } catch (error) { this.db.exec('ROLLBACK'); throw error; }
    return this.publicUser(row);
  }
}
