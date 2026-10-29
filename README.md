# PramaanScope

Evidence-led institutional compliance review. A local SIH26261 prototype using synthetic records.

## Open the application

With Node.js 24.15 or newer installed:

```powershell
cd "C:\Users\aksha\OneDrive\Documents\SIH Grand Final\pramaanscope"
npm ci
npm run build
npm start
```

Open **http://127.0.0.1:47261**. If dependencies and the build already exist, just use `npm start` or double-click `Start PramaanScope.cmd`. The dedicated port avoids older CompliScan offline interfaces associated with ports 4177 and 4180; no CompliScan browser data needs to be cleared.

The application is bound to localhost. It is not publicly deployed. Stop it with Ctrl+C. Records persist in `data/pramaanscope.sqlite`; originals are retained in `data/originals`. These directories are ignored by version control.

Development: run `npm run dev` for the API and `npm run dev:web` in a second terminal for the Vite interface at http://127.0.0.1:5177.

## Protected local workspace

Double-click `Start Protected PramaanScope.cmd` and open **http://127.0.0.1:47263**. It uses separate `.pilot-data` storage and genuine server-verified accounts instead of the demonstration persona selector. See [PILOT_SETUP.md](PILOT_SETUP.md) for first-account setup and the permission model. There are no default credentials or first-run key. Prototype passwords require at least 6 characters and have no composition rules.

The protected mode is a local pilot foundation with synthetic records, not a public production deployment. Institution accounts are assigned to the one supported application. Issuer responses remain simulated in both modes.

## Demonstrate the key feature

1. On Overview, choose **Inspect discrepancy**.
2. Inspect the certificate and its extracted Campus B assertion. The application is for Campus A.
3. Add a note and choose **Mark reviewed** to retain the original review.
4. Enter a precise request and choose **Request clarification**.
5. Choose **Open correction workspace**, then **Use corrected sample**.
6. Inspect the calculated changes, affected findings, and previous review count.
7. Choose **Accept & recalculate**.
8. Return to Evidence review. The current campus check is consistent and the previous reviews are labeled Earlier evidence.
9. Check source verification separately. All responses are simulated and cannot establish independent authenticity.
10. Export the report. Reset the synthetic demo through the footer when needed.

Documents also provides a real local OCR sample. The bundled Tesseract worker and English language data make no cloud requests. For user-uploaded images, local OCR text is explicitly labeled client-produced and unreviewed.

## Architecture

- React/TypeScript/Vite frontend with semantic HTML, local Inter font, Lucide icons, and shared CSS design tokens.
- Node/Express API, Zod validation, SQLite, generated private file paths, actual native-PDF text extraction, and SHA-256 originals.
- Server rule functions separate completeness, identity, campus, period/validity, historical intake, and source comparison.
- Conservative document-level dependencies determine affected findings. Human reviews reference exact finding fingerprints.
- Candidate upload and replacement confirmation are separate. Confirmation rejects an outdated application revision.
- SQLite transactions retain old versions and update the active evidence together.
- OCR loads only when used and reuses its worker. No Python server, external database, cloud model, or queue is required.

CompliScan supplied the local-OCR preparation pattern and evidence/review/report concepts. Its checkout is unchanged. Metrology rules, barcode calibration, and maps are not part of this application.

## Supported prototype input

PDF, PNG, JPEG; 10 MB per file; ten PDF pages. Document type is selected by the user. The demonstration parser recognizes labeled English fields such as Institution ID, Campus, Academic Year, Approval Period, Course, Approved Intake, Certificate ID, Valid From, Valid Until, and Issuer. It is not a general-purpose institutional document model.

Ambiguous dates stay unresolved. Scanned PDFs with no native text require page images in this version. Parser failures retain the original and show an extraction error. Failed or unsupported evidence cannot silently pass a content check.

## Tests and evaluation

```powershell
npm test
npm run evaluate
npm run test:e2e
```

The browser tests require the running local server and installed Chrome. Playwright recording also requires `npx playwright install ffmpeg`. Browser tests and recording reset the synthetic application; export a report first if you want to preserve its current review session.

Evaluation writes actual expected-versus-observed outcomes for twelve generated synthetic PDF packets. It does not establish population-level accuracy or staff time savings. Browser accessibility checks cover the web interface, excluding native PDF viewer contents, and do not constitute certification.

## Submission materials

See `submission/` for the demonstration video, presentation draft, sample review report, screenshots, and executed evaluation results. The presentation is not the official SIH template. Check the current portal's template, length, file-size, and video-duration requirements before submitting.

The captioned walkthrough can be reproduced with `npm run record` when its local FFmpeg encoding tool is available. The capture script documents every real interaction; it does not substitute mock screens for the application.

## Explicit limitations

- Synthetic institutional profile and demonstration checklist, not an authoritative AICTE rule pack.
- Issuer response fixtures, not government API access or live portal integration.
- Original-file hashes, not document-authenticity proof. Digital signatures are not cryptographically validated.
- The default demonstration mode uses a persona selector, not authentication. Protected mode adds real local accounts, application assignments, expiring sessions, CSRF checks, and institution-note filtering. Both modes remain localhost-only and use synthetic records.
- Infrastructure evidence readiness and manual notes, not automated inspection or physical certification.
- Local event history, not independently witnessed or tamper-proof storage.
- All statutory decisions remain outside this prototype. Completing a review session does not approve an institution.

For a real institutional pilot, validate applicable requirements and amendments with domain users, review identity provisioning and recovery, add authorized issuer adapters, implement supported signature trust/revocation checks, and prepare a hardened deployment with PostgreSQL/private object storage.
