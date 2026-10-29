# Protected local workspace

This mode adds genuine sign-in and server-side permissions to the existing synthetic SIH26261 workflow. It is a local pilot foundation. It does not establish institutional identity, document authenticity, regulatory compliance, or readiness for public hosting.

## First run

1. Build the application with `npm run build` if necessary.
2. Double-click `Start Protected PramaanScope.cmd`. Keep its terminal running.
3. Open http://127.0.0.1:47263.
4. Enter your name, use any username or email address of 3–100 characters, and enter a password of 6–128 characters. No other username format or password composition rule is required in this prototype.
5. Create the reviewer account. No first-run key is required. Once the first reviewer exists, the setup endpoint closes and cannot create another reviewer.
6. Use **Accounts** in the workspace to create institution accounts assigned to PS-2026-0042. Institution passwords are chosen by the provisioning reviewer; share them only through an agreed private channel.

No default usernames or passwords are installed. Automated tests provision disposable synthetic accounts only in temporary test folders; they do not provision the user's protected workspace.

Protected storage is `.pilot-data/pramaanscope.sqlite` plus `.pilot-data/originals`. The demonstration at port 47261 uses separate `data/` storage. Do not copy private records into either workspace for this demonstration.

Equivalent PowerShell launch:

```powershell
$env:PRAMAAN_MODE='pilot'
$env:PRAMAAN_DATA_DIR='.pilot-data'
$env:PORT='47263'
npm start
```

## Permissions

| Action | Reviewer | Assigned institution |
|---|---|---|
| Read application evidence and findings | Yes | Yes |
| Read clarification requests and review status | Yes | Yes |
| Read private review notes, assessment details, events, historical analysis and reports | Yes | No |
| Upload evidence or submit a candidate where permitted | Yes | Yes |
| Request clarification, record review, accept replacement, complete review | Yes | No |
| Run simulated source fixture or manual infrastructure assessment | Yes | No |
| Create/disable institution accounts | Yes | No |
| Reset the synthetic database through the UI | No | No |

An application assignment is checked before access to documents as well as application URLs. This release has one supported application and one initial reviewer; it is not a complete multi-tenant system. A user's browser cannot choose a different role through the old demonstration header.

Institution responses retain review status and evidence-version fingerprints but omit reviewer note content and identities. Infrastructure descriptions and dependency metadata are filtered too. Clarification text is deliberately institution-facing. Reviewer reports remain reviewer-only.

## Implemented controls

- Salted asynchronous scrypt password hashes, using N=32768, r=8, p=3; password-work concurrency limited to two.
- Cryptographically random 256-bit session tokens. SQLite retains token hashes, not raw bearer tokens.
- HttpOnly, SameSite=Strict, host-only cookies named per local server port. Session credentials are not stored in localStorage.
- CSRF token and origin checks for authenticated writes. Sessions are replaced at sign-in and revoked at sign-out or account disabling.
- Thirty-minute idle expiry and eight-hour absolute expiry; server-side session/account records survive restarts.
- Persistent sign-in throttling for normal login, generic invalid-credential responses, and bounded password input. First-reviewer setup is limited by the one-time database state instead of a setup key.
- Audit events include the authenticated account ID and name for evidence, review, replacement, account administration, and sign-in/sign-out actions.

Design references: [Node crypto](https://nodejs.org/api/crypto.html#cryptoscryptpassword-salt-keylen-options-callback), [OWASP password storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html), and [OWASP session management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html). These references guide the implementation; no compliance certification or independent security audit is claimed.

## Before an institutional deployment

The service binds to HTTP loopback only. Cookies do not have the Secure flag in this local build; public hosting requires HTTPS, Secure cookies, trusted host/proxy configuration, and a separate deployment review. Do not expose the current process through a public tunnel.

Account recovery, self-service password change, SSO/MFA, additional reviewers, organization membership administration, encrypted backups, retention policies, and multi-application isolation remain follow-up work. The current reviewer can disable an institution account and provision a replacement account; there is no email recovery or automatic reactivation flow. A forgotten reviewer password requires a deliberate offline recovery procedure, which is not implemented here.

Validate official requirements with domain reviewers, obtain authorized issuer access, and evaluate extraction on authorized representative records. Source fixtures, signature limitations, and synthetic checklist labels remain unchanged in protected mode. See `IMPLEMENTATION_STATUS.md` for the broader pilot roadmap.
