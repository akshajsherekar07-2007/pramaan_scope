# Implementation status — 27 October 2026

PramaanScope implements the agreed SIH26261 local prototype. Open http://127.0.0.1:47261. The earlier CompliScan ports are not the entry point for this application.

## Agreed scope and implementation

| Planned capability | Delivered behavior | Main source |
|---|---|---|
| Professional institutional workspace | Four responsive views; navy/teal tokens; local font; keyboard focus; loading/error/empty states | `client/App.tsx`, `client/styles.css` |
| Evidence intake | PDF/PNG/JPEG uploads, size/type checks, private originals, version history, duplicate-byte warning | `server/index.ts`, `server/store.ts` |
| Extraction and provenance | Native PDF text, original-page PNG previews, field/page references, lazy local image OCR | `server/documents.ts`, `client/ocr.ts` |
| Requirement–evidence matrix | Twelve findings across six groups; content, source, and human review remain distinct | `server/rules.ts`, `client/App.tsx` |
| Specific clarification | Evidence-linked requests and retained reviewer notes | `server/store.ts` |
| Correction impact preview | Candidate parsed before activation; changed assertions, dependent findings, prior reviews, and unchanged findings calculated | `server/store.ts` |
| Review validity | Fingerprints bind reviews to evidence versions; replacement preserves earlier reviews without showing them as current | `server/rules.ts`, `server/store.ts` |
| Atomic replacement | Confirmation rejects outdated application revision; original and replacement retained in SQLite transaction | `server/store.ts` |
| Source comparison | Explicit match/mismatch/unavailable fixtures and recorded manual verification | `server/store.ts` |
| Infrastructure assistance | Evidence readiness plus manual assessment or inspection recommendation | `server/store.ts` |
| Reports and history | Generated PDF report, prior versions, review history, local events | `server/report.ts`, `server/store.ts` |
| Submission demonstration | Captioned working-application video, screenshots, synthetic evaluation, six-slide presentation draft | `submission/` |
| Protected local access | One-time reviewer setup; named institution accounts; salted password hashes; server sessions, CSRF, application assignment, revocation | `server/auth.ts`, `client/Access.tsx` |
| Institution privacy | Clarifications and review status visible; private notes, assessment metadata, internal events and reports restricted | `server/index.ts` |

Protected mode is now available separately at http://127.0.0.1:47263 with `.pilot-data` storage. The first reviewer is created directly in the setup page without a first-run key. Prototype passwords require at least 6 characters and no composition rules. See `PILOT_SETUP.md`.

The frontend uses shared CSS tokens instead of adding a Tailwind runtime. SQLite remains the selected MVP database. OCR is loaded on demand and its worker is reused. Original-page rendering uses a bounded cache and concurrent-request deduplication. External issuer calls are not on the critical path.

## Verification scope

- Production TypeScript/Vite build.
- API/rule regression suite: 40 passes, including extraction, clarification gating, replacement impact, stale preview rejection, old-review preservation, source outage, reports, real authentication, note privacy, CSRF, role/scope enforcement, revocation, throttling, and idle/absolute session expiry.
- Six browser scenarios: accessibility scans, responsive layouts, full correction journey with rendered originals, real local OCR without external HTTP, source outage/persona controls, and the protected reviewer/institution journey. The protected test uses its own temporary server and synthetic credentials.
- Twelve generated synthetic PDF cases with expected-versus-observed results in `submission/evaluation-results.json`.
- Final video decoded end to end; this establishes media readability, not regulatory correctness.

Browser tests and recording reset synthetic data. Use `PRAMAAN_BASE_URL` with a separate server and `PRAMAAN_DATA_DIR` when running those checks while someone is reviewing the application. API tests create their own temporary SQLite workspace.

## Remaining work for a real pilot

These items were deliberately outside the agreed local MVP and are not complete:

1. Validate the full official problem brief, applicable AICTE categories, rule sources, and amendments with domain reviewers.
2. Extend the local account foundation with organization-approved identity provisioning, recovery, multi-factor authentication or SSO as required, and multi-application data isolation. Current assignments protect the one supported application; a multi-tenant deployment is not implemented.
3. Obtain authorized issuer integrations and implement supported digital-signature trust/revocation checks. Hashes and simulated source matches cannot establish authenticity.
4. Expand extraction beyond labeled English demonstration documents, including scanned multi-page PDFs; evaluate on authorized representative records.
5. Migrate to PostgreSQL and private object storage for a multi-user deployment; add backups, retention controls, monitoring, and deployment hardening.
6. Conduct an officer/institution usability pilot and measure actual errors and review time. No population-level accuracy or time-saving claim is established.

Before submission, check the portal's current presentation template, file-size limits, duration requirements, and team details. The included slides are a draft, and the video has captions without narration.
