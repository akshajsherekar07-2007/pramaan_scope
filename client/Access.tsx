import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, Building2, KeyRound, LoaderCircle, LockKeyhole, ShieldCheck, UserPlus } from 'lucide-react';
import type { AccessSession, Account } from '../shared/types';
import { request, setCsrfToken } from './api';
import { Modal } from './components';
import App from './App';

export default function Access() {
  const [session, setSession] = useState<AccessSession | null>(null);
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [accounts, setAccounts] = useState(false);
  const [username, setUsername] = useState(''); const [password, setPassword] = useState(''); const [name, setName] = useState('');
  const acceptSession = (value: AccessSession) => { setCsrfToken(value.csrf); setSession(value); setPassword(''); setError(''); };
  const refresh = () => request<AccessSession>('/api/auth/session').then(acceptSession).catch(failure => setError(failure.message));
  useEffect(() => { void refresh(); const expired = () => { setCsrfToken(''); setSession(current => current ? { ...current, user: null, csrf: '' } : null); setAccounts(false); setError('Your session ended. Sign in again to continue.'); }; window.addEventListener('pramaan:session-expired', expired); return () => window.removeEventListener('pramaan:session-expired', expired); }, []);
  useEffect(() => { if (!session?.expiresAt) return; const timer = setTimeout(() => window.dispatchEvent(new Event('pramaan:session-expired')), Math.max(0, session.expiresAt - Date.now())); return () => clearTimeout(timer); }, [session?.expiresAt]);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try { acceptSession(await request<AccessSession>(session?.setupRequired ? '/api/auth/setup' : '/api/auth/login', { method: 'POST', body: JSON.stringify(session?.setupRequired ? { username, password, name } : { username, password }) })); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Sign-in could not be completed.'); } finally { setBusy(false); }
  }
  async function signOut() { setBusy(true); try { await request('/api/auth/logout', { method: 'POST', body: '{}' }); acceptSession({ mode: 'pilot', setupRequired: false, user: null, csrf: '', expiresAt: null }); setAccounts(false); } catch (failure) { setError((failure as Error).message); } finally { setBusy(false); } }
  if (session?.mode === 'demo') return <App />;
  if (session?.user) return <><App access={session} onSignOut={() => void signOut()} onAccounts={() => setAccounts(true)} />{error && <div className="access-global-error" role="alert">{error}</div>}{accounts && <Accounts onClose={() => setAccounts(false)} />}</>;
  return <main className="access-shell">
    <section className="access-story" aria-label="PramaanScope workspace">
      <a className="brand" href="/"><div className="brand-symbol">P<span /></div><div><strong>PramaanScope</strong><small>INSTITUTIONAL ASSURANCE</small></div></a>
      <div className="access-story-copy"><span className="eyebrow">INSTITUTIONAL REVIEW WORKSPACE</span><h1>Every review starts<br />with the evidence.</h1><p>Understand what a document supports, what needs clarification, and what changes after a correction.</p><div className="access-principles"><span><ShieldCheck size={19} /> Role-based access</span><span><Building2 size={19} /> Application review</span><span><LockKeyhole size={19} /> Evidence and review history</span></div></div>
      <p className="access-story-footer">Protected workspace · Demo data</p>
    </section>
    <section className="access-form-pane"><div className="access-form-wrap">
      <div className="access-icon"><KeyRound size={25} /></div>
      <span className="eyebrow teal-text">PROTECTED ACCESS</span>
      <h2>{!session ? 'Opening your workspace' : session.setupRequired ? 'Set up your reviewer account' : 'Welcome back'}</h2>
      <p className="access-intro">{session?.setupRequired ? 'Create a reviewer account to get started.' : 'Sign in with the account assigned to your application.'}</p>
      {!session ? <>{error ? <><p className="error-text" role="alert">{error}</p><button className="button primary" onClick={() => void refresh()}>Retry connection</button></> : <LoaderCircle className="spin" aria-label="Loading access settings" />}</> : <form onSubmit={submit} className="access-form">
        {session.setupRequired && <label>Your name<input value={name} onChange={event => setName(event.target.value)} autoComplete="name" required minLength={2} maxLength={100} /></label>}
        <label>Username or email<input value={username} onChange={event => setUsername(event.target.value)} autoComplete="username" autoCapitalize="none" spellCheck={false} required minLength={3} maxLength={100} /></label>
        <label>Password<input value={password} onChange={event => setPassword(event.target.value)} type="password" autoComplete={session.setupRequired ? 'new-password' : 'current-password'} required minLength={6} maxLength={128} /></label>
        {session.setupRequired && <p className="small muted">At least 6 characters.</p>}
        {error && <p className="access-error" role="alert">{error}</p>}
        <button className="button primary access-submit" disabled={busy}>{busy ? <LoaderCircle size={18} className="spin" /> : <ArrowRight size={18} />}{session.setupRequired ? 'Create account' : 'Sign in'}</button>
      </form>}
      <p className="access-footnote">Your session expires after 30 minutes of inactivity.</p>
    </div></section>
  </main>;
}

function Accounts({ onClose }: { onClose: () => void }) {
  const [users, setUsers] = useState<(Account & { enabled: boolean })[]>([]); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const [name, setName] = useState(''); const [username, setUsername] = useState(''); const [password, setPassword] = useState('');
  const load = () => request<(Account & { enabled: boolean })[]>('/api/auth/users').then(setUsers);
  useEffect(() => { void load().catch(failure => setError(failure.message)); }, []);
  async function create(event: FormEvent) { event.preventDefault(); setBusy(true); setError(''); setNotice(''); try { await request('/api/auth/users', { method: 'POST', body: JSON.stringify({ name, username, password }) }); setPassword(''); setUsername(''); setName(''); await load(); setNotice('Institution account created for this application.'); } catch (failure) { setError((failure as Error).message); } finally { setBusy(false); } }
  async function disable(id: string) { setBusy(true); setError(''); try { await request(`/api/auth/users/${id}/disable`, { method: 'POST', body: '{}' }); await load(); setNotice('Account disabled. Its active sessions have been revoked.'); } catch (failure) { setError((failure as Error).message); } finally { setBusy(false); } }
  return <Modal title="Workspace accounts" onClose={onClose}><div className="modal-body">
    <p>Manage institution access. Reviewer notes and reports stay private.</p>
    <div className="account-list">{users.map(user => <div className="account-row" key={user.id}><div><strong>{user.name}</strong><span>{user.username} · {user.role === 'REVIEWER' ? 'Reviewer' : 'Institution'} · {user.enabled ? 'Active' : 'Disabled'}</span></div>{user.role === 'INSTITUTION' && user.enabled && <button className="button secondary" disabled={busy} onClick={() => void disable(user.id)}>Disable access</button>}</div>)}</div>
    <form className="access-form account-create" onSubmit={create}><h3><UserPlus size={18} /> Add an institution account</h3><label>Account name<input value={name} onChange={event => setName(event.target.value)} required minLength={2} maxLength={100} autoComplete="off" /></label><label>New username or email<input value={username} onChange={event => setUsername(event.target.value)} required minLength={3} maxLength={100} autoCapitalize="none" autoComplete="off" /></label><label>Initial password<input type="password" value={password} onChange={event => setPassword(event.target.value)} required minLength={6} maxLength={128} autoComplete="new-password" /></label><p className="small muted">Password: at least 6 characters.</p>{error && <p className="error-text" role="alert">{error}</p>}{notice && <p role="status">{notice}</p>}<button className="button primary" disabled={busy}>{busy ? <LoaderCircle className="spin" size={16} /> : <UserPlus size={16} />}Create institution account</button></form>
  </div></Modal>;
}
