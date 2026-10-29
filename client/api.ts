import { APP_ID, type Persona, type Snapshot } from '../shared/types';
export const applicationPath = `/api/applications/${APP_ID}`;
let csrfToken = '';
export function setCsrfToken(value: string) { csrfToken = value; }
export async function request<T>(path: string, options: RequestInit = {}, persona: Persona = 'REVIEWER'): Promise<T> {
  const response = await fetch(path, {
    ...options, signal: options.signal || AbortSignal.timeout(60000),
    headers: { 'X-PramaanScope': 'local-demo', 'X-Demo-Persona': persona, ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}), ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}), ...options.headers }
  });
  const data = await response.json().catch(() => ({ error: 'The server returned an unreadable response.' }));
  if (!response.ok) { if (response.status === 401 && !path.startsWith('/api/auth/')) window.dispatchEvent(new Event('pramaan:session-expired')); throw new Error(data.error || 'The operation could not be completed.'); }
  return data;
}
export const loadApplication = () => request<Snapshot>(applicationPath);
