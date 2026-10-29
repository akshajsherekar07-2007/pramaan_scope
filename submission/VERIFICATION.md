# Prototype verification — 27 October 2026

- Production build: passed TypeScript checking and Vite build.
- API/rule tests: 40 passed, zero failures. Includes keyless one-time reviewer setup with the 6-character minimum, scrypt hashes, token storage, CSRF, role-header spoofing, application scope, private-note filtering, correction workflow, login throttling, revocation, expiry, and restart persistence. The loopback API tests require an execution environment that permits local connections.
- Saved browser results: 6 expected passes, zero unexpected failures, zero skipped tests, zero flaky tests (`test-results/browser-results.json`). Includes the protected setup/reviewer/institution correction journey and accessibility scans of the setup and account forms.
- Synthetic PDF evaluation: 12 expected-versus-observed cases passed (`evaluation-results.json`). This is not a real-world accuracy estimate.
- Captioned MP4: decoded end to end with FFmpeg without decoding errors. The recording has no narration.
- Updated presentation: six slides; package, layout, font-policy and Artifact Tool import checks passed. Original-document previews on slides 2 and 3 visually checked.
- User-facing application: browser-confirmed at http://127.0.0.1:47261 with the PramaanScope title, synthetic institution, and requirement–evidence matrix.

The application is a local synthetic-data prototype. Protected mode now implements real local accounts and sessions. Public deployment hardening, identity lifecycle/recovery, multi-tenant storage, signature validation and live government integration remain unimplemented. Existing video and presentation demonstrate the earlier MVP workflow and do not show the new account setup. Portal-specific submission requirements remain to be checked before uploading.
