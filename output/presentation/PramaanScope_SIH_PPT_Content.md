# PramaanScope - SIH presentation content

**Problem statement:** SIH26261  
**Team:** CELESTIAL_OUTLAWS  
**Team leader:** Akshaj Sherekar  
**Team ID:** Leave blank until available  
**Prepared:** 27 October 2026

This is the content master for the six-slide presentation. Each slide contains concise material to display, supporting points to explain aloud, and the visual that best supports it. Speaker notes are supporting material, not additional slides.

## 1. Required structure from the supplied SIH template

| Slide | Template section | Points that must be covered |
| --- | --- | --- |
| 1 | Title page | Problem Statement ID, full title, theme, category, Team ID and registered team name. |
| 2 | Idea title / proposed solution | Explain the solution, how it addresses the problem, and its innovation and uniqueness. |
| 3 | Technical approach | Technologies, methodology, implementation process, and a flowchart, image or working-prototype view. |
| 4 | Feasibility and viability | Explain feasibility, challenges and risks, and strategies to address them. |
| 5 | Impact and benefits | Identify the target audience and explain relevant benefits. |
| 6 | Research and references | Include the research basis and useful source links. |

### Submission rules stated in the supplied template

- Maximum **six slides in total, including the title slide**.
- Keep the provided template and its required section topics.
- Use concise points, diagrams and relevant pictures instead of paragraphs.
- Keep explanations precise and easy to understand.
- Explain the idea's innovation and uniqueness.
- Remove the template's instructional slide from the submission.
- Export the completed presentation as a **PDF** for submission. Keep the editable PowerPoint separately.

The supplied template is the basis for these requirements. Check the submission portal for any later instructions before uploading.

---

## Slide 1 - Title page

### Main title

**PramaanScope**

### Product description

**Institutional evidence review with correction impact tracking**

### Required information

- **Problem Statement ID:** SIH26261
- **Problem Statement Title:** AI-Powered Application Validation, Document Authentication and Regulatory Compliance Verification
- **Organization:** AICTE
- **Theme:** Smart Automation
- **PS Category:** Software
- **Team Name:** CELESTIAL_OUTLAWS
- **Team Leader:** Akshaj Sherekar
- **Team ID:** __________________

### Opening explanation

> PramaanScope helps a reviewer understand whether submitted documents support the correct institution, campus and period. When an institution corrects a document, the application shows which findings and earlier reviews need attention again.

### Visual

- Preserve the SIH 2026 logo and title artwork from the supplied template.
- Make PramaanScope the main product name.
- Keep the full problem title readable and the team details separate.

### Accuracy note

The theme comes from the reproduced problem listing. Confirm it against the team's registered portal entry. Do not invent a Team ID.

---

## Slide 2 - Idea title and proposed solution

### Slide title

**PRAMAANSCOPE**

### Main message

**Evidence that applies to the right campus**

### The problem in one line

An uploaded document can contain matching details and still fail to support the requirement under review.

### Proposed solution - display points

- Read supported application documents and show the original evidence.
- Check institution identity, campus, relevant period and historical intake.
- Explain each discrepancy and the exact evidence needed to resolve it.
- Preview the impact of a proposed replacement before the reviewer accepts it.
- Preserve earlier documents and keep reviews tied to their evidence versions.

### Innovation and differentiation - emphasize

**Correction impact preview with review validity tracking**

- Calculate which findings depend on the document being replaced.
- Identify earlier review actions affected by that replacement.
- Keep content checks, source verification and human review separate.

### Concrete example

**Application: Campus A**  
**Submitted certificate: Campus B**

The certificate does not establish the Campus A requirement. The reviewer requests evidence for Campus A, then inspects the proposed correction and its consequences.

### Supporting explanation for the presenter

- A readable certificate is not automatically suitable evidence for this application.
- A wrong-campus finding is a scope discrepancy, not proof of forgery.
- The institution receives a specific request instead of a vague instruction to upload documents again.
- A candidate upload does not silently replace the active evidence.
- The distinguishing demonstration is the connected review journey, not OCR alone.

### Visual

- Use the generated illustration of two campuses and a certificate.
- Pair it with the Campus A / Campus B example in editable text.
- Give the correction-impact feature the strongest emphasis.

### Layout priority

Fit the proposal into a few short points. Explain the finer details verbally. Keep the problem example, the solution and the differentiator visible together.

---

## Slide 3 - Technical approach

### Slide title

**TECHNICAL APPROACH**

### Methodology / flowchart labels

1. **Upload** - Retain the original PDF or image.
2. **Extract** - Read native PDF text or run local image OCR.
3. **Evaluate** - Run twelve findings across six check groups.
4. **Review** - Inspect evidence and request precise clarification.
5. **Correct** - Preview impact, accept the candidate and reassess.

### Technologies - display points

| Layer | Technology | Purpose |
| --- | --- | --- |
| Frontend | React, TypeScript, Vite | Responsive evidence and review workspace. |
| Backend | Node.js, Express | API, permissions and server-side rule evaluation. |
| Database | SQLite | Application records, document versions, findings and reviews. |
| Original documents | Private local file storage | Preserve submitted evidence under generated identifiers. |
| PDF processing | pdf-parse | Extract native text and render original pages. |
| Image OCR | Tesseract.js with local English assets | Read supported scanned images without a mandatory cloud API. |
| Reporting | jsPDF | Export the review report. |

For the visible slide, use a compact stack summary rather than displaying every explanation in this table.

### Six check groups - explain when presenting

- Evidence readiness and required documents.
- Institution identity across supporting records.
- Campus applicability.
- Academic period and certificate validity.
- Declared historical course and intake.
- Source-comparison status.

### Core engineering points

- A finding records the document versions on which it depends.
- A fingerprint ties a review to the finding's evidence basis.
- Candidate and active documents remain separate until acceptance.
- Confirmation rejects an outdated application revision.
- A database transaction preserves the old version and activates the replacement together.

### Working-prototype visual

Show the actual correction-impact screen with:

- Original document and proposed replacement.
- Changed extracted fields.
- Affected findings.
- Affected earlier review actions.
- Findings with unchanged registered dependencies.

### Important technical boundaries

- The current small evaluator reruns all twelve checks. Dependencies identify impact and review validity; they do not yet schedule only selected rule functions.
- Browser-produced OCR is explicitly labeled unreviewed extraction.
- Issuer responses are simulated. A simulated match does not establish independent authenticity.
- No cloud LLM or general trained institutional-document classifier is connected.

---

## Slide 4 - Feasibility and viability

### Slide title

**FEASIBILITY AND VIABILITY**

### Main message

**A working local prototype with tested review controls**

### Feasibility - display points

- The application runs locally with a single API and frontend origin.
- SQLite and private file storage avoid a separate database service for the demonstration.
- Native PDF extraction and bundled image OCR are implemented.
- Protected reviewer and institution accounts enforce the supported roles.
- Correction preview, acceptance and retained review history work together.

### Evidence of implementation

- **40 API and rule tests passed.**
- **12 prepared synthetic PDF cases matched expected outcomes.**
- **Production frontend build and protected browser journey passed.**

Display the first two figures prominently. Keep the scope of the figures beside them or in a readable footnote.

### Challenges, risks and strategies

| Challenge / risk | Strategy |
| --- | --- |
| Unreadable or ambiguous evidence | Keep the finding unresolved and show the original evidence for review. |
| A replacement changes an already reviewed finding | Tie reviews to evidence fingerprints and flag the need for renewed review. |
| The application changes after the preview | Reject the old preview and require a refreshed impact calculation. |
| Issuer access is unavailable | Show coverage and outage status explicitly, with manual follow-up. |
| Real documents differ from demonstration layouts | Test representative formats and expand extraction only after evaluation. |
| Rules vary by category or amendment | Validate the applicable checklist and its sources with domain reviewers. |
| Institutional information requires restricted access | Enforce account roles and application assignment; filter private reviewer notes. |

Use four of these pairs on the visible slide. Keep the remaining pairs in speaker notes.

### Viability explanation

The current design is suitable for a repeatable local demonstration. Institutional use requires approved rules, authorized source access, representative document testing and deployment work. The current build does not establish production-scale throughput or a national operating cost.

### Visible disclosure

**Synthetic tests demonstrate application behavior. Live issuer integration and cryptographic signature validation remain pilot work.**

---

## Slide 5 - Impact and benefits

### Slide title

**IMPACT AND BENEFITS**

### Main message

**Clearer corrections and accountable review**

### Target audience

- Authorized scrutiny officers and reviewers.
- Institution application coordinators.
- Review supervisors and process owners.

### Benefits - display points

**For reviewers**

- Identify findings that depend on changed evidence.
- See the evidence and reason behind a discrepancy.
- Keep unaffected review context visible.

**For institutions**

- Receive a precise request for the evidence needed.
- Propose a replacement through a controlled correction process.
- Understand which issue the new document is meant to resolve.

**For accountability**

- Preserve original evidence and earlier review reasons.
- Distinguish a review of old evidence from a review of current evidence.
- Keep unresolved verification visible in the report.

### Benefit categories to explain aloud

| Category | Relevant benefit | Claim boundary |
| --- | --- | --- |
| Administrative / technical | More structured scrutiny and clearer consequences of corrections. | The implemented workflow demonstrates the mechanism. |
| Social / service experience | Clearer communication between institutions and reviewers. | User satisfaction and fairness improvements need evaluation. |
| Economic / operational | Potential reduction in unnecessary rereading and correction exchanges. | No measured cost or staff-time savings are available. |
| Environmental | A digital workflow could avoid some duplicate printing. | Printing reduction has not been measured; it is not a headline result. |

### Pilot measures

- Reviewer time per packet.
- Number of clarification and correction cycles.
- Missed findings that should have received renewed review.
- False discrepancy alerts and unsupported acceptance.

### Visual

Use the generated illustration of an officer and institution coordinator reviewing evidence. Label it as an illustration. Keep benefits in a clear text area beside it.

### Presenter explanation

The benefits follow from the workflow: precise requests could reduce confusion, impact tracking could reduce unnecessary repeated scrutiny, and preserved history makes decisions easier to explain. These are expected benefits to validate with reviewers, not measured deployment results.

---

## Slide 6 - Research and references

### Slide title

**RESEARCH AND REFERENCES**

### Main message

**The opportunity is the connected institutional scrutiny workflow**

### Research findings and design response

| What the research showed | What we built in response |
| --- | --- |
| Document extraction and packet validation already exist. | Check whether evidence applies to the selected institution, campus and period. |
| Evidence requests and review workflows already exist. | Link clarification to a specific finding and document. |
| Evidence-driven re-evaluation has commercial precedents. | Implement replacement-impact preview and review validity in our institutional case. |
| Official verification services have access and coverage limits. | Separate simulated comparison, unavailable sources and independent verification. |

### Our research gap statement

> The opportunity we target is a connected review journey: applicable evidence, a precise clarification, a proposed correction, its calculated impact, and renewed review with preserved history.

### Our differentiation statement

> PramaanScope shows which requirements the evidence supports, what remains unresolved, and which earlier reviews need attention after a permitted correction.

### Reference links for the visible slide

1. [AICTE Approval Process Handbook release - Ministry of Education / PIB](https://www.pib.gov.in/PressReleasePage.aspx?PRID=1983013&lang=2&reg=48)
2. [Instabase - Validating packets](https://docs.instabase.com/automate/validating-packets)
3. [Diligent - Responding to and submitting evidence](https://help.diligentoneplatform.com/helpdocs/d1p/en-us/Content/evidence_hub/tasks/respond-to-and-submit-evidence.htm)
4. [Kloom - Continuous due diligence and KYC](https://kloom.ai/continuous-due-diligence-kyc/)
5. [Entity Locker - MeitY / PIB](https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=2094574&lang=2&reg=3)

Use readable source titles with clickable links. Put supporting details in speaker notes instead of long URLs across the slide.

### Additional references for speaker notes

- [Detailed SIH26261 brief reproduction](https://zaidsayyed.in/tools/sih-problem-statements/sih26261) - provisional third-party source; confirm the complete official brief.
- [Google Document AI](https://cloud.google.com/document-ai) - extraction, classification and document processing.
- [W3C PROV](https://www.w3.org/ns/prov) - provenance and derivation concepts.
- [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/) - verification and reliance on claims are distinct questions.
- [CCA signature-verification guidance](https://www.cca.gov.in/index.php/signature_verification.html) - certificate-chain and revocation considerations.
- [DigiLocker NAD verifier process](https://nad.digilocker.gov.in/Verifier) - registration, consent and academic-award availability.
- [Creatrix Campus accreditation management](https://www.creatrixcampus.com/accreditation-management-software) - education evidence and workflow context.
- [Ocrolus Detect](https://docs.ocrolus.com/docs/detect) - established document-fraud signals.

### Research limitations to explain accurately

- This is desk research based on public documentation and project implementation evidence.
- No AICTE officer interview or direct comparative vendor trial was conducted.
- Public documentation does not reveal every competitor feature or AICTE internal deployment.
- Evidence-driven re-evaluation already has prior art. Do not claim a worldwide first.
- Our demonstrated distinction is the working institutional applicability and correction workflow.

---

## 2. Useful content patterns taken from the reference presentations

These are presentation patterns to apply to our own project, not technical claims borrowed from the references.

| Useful pattern in the references | Where to apply it | PramaanScope content |
| --- | --- | --- |
| State the objective before listing features. | Slide 2 | Help a reviewer assess applicable evidence and handle corrections. |
| Show how the solution addresses the problem. | Slide 2 | Use the Campus A application / Campus B certificate example. |
| Give the distinguishing feature a separate emphasis. | Slide 2 | Correction impact preview and review validity tracking. |
| Explain methodology visually. | Slide 3 | Upload, extract, evaluate, review and correct. |
| Associate technologies with their actual roles. | Slide 3 | UI, API, extraction, storage and reporting. |
| Show the working product where possible. | Slide 3 | Actual calculated-impact screenshot. |
| Pair every major challenge with a strategy. | Slide 4 | Ambiguous evidence, stale reviews, source access and rule diversity. |
| Support feasibility with evidence. | Slide 4 | Executed tests and prepared synthetic cases. |
| Explain audience impact separately from features. | Slide 5 | Reviewer, institution and accountability benefits. |
| Group benefits into relevant categories. | Slide 5 | Administrative, social and potential operational benefits. |
| Make research traceable through source links. | Slide 6 | Government announcements, platform documentation and standards. |
| Explain what makes the approach different. | Slides 2 and 6 | The connected evidence-to-correction-to-renewed-review journey. |

Do not reuse the reference presentations' datasets, technical architectures, cost estimates or performance numbers. Our claims must describe our own application and evidence.

## 3. Essential content coverage check

| Question a judge should be able to answer | Where we answer it |
| --- | --- |
| Which problem statement is this? | Slide 1 |
| What does the application do? | Slide 2 |
| What is the actual problem? | Slide 2 example and opening explanation |
| Who uses it? | Slides 2 and 5 |
| Why is this approach useful? | Slides 2 and 5 |
| What makes it different? | Slides 2, 3 and 6 |
| How does it work? | Slide 3 |
| What technologies power it? | Slide 3 |
| Is anything implemented? | Working screen on Slide 3 and evidence on Slide 4 |
| Is it feasible? | Slide 4 |
| What can go wrong, and how do we respond? | Slide 4 |
| What benefits should we expect? | Slide 5 |
| What research supports the approach? | Slide 6 |
| What is simulated or unverified? | Slides 3 and 4, with supporting notes |

## 4. Statements to keep accurate throughout the deck

- **Working today:** selected-field extraction, local image OCR, evidence-linked checks, clarification, candidate replacement, calculated impact, preserved versions and reviews, protected local accounts and report export.
- **Synthetic or simulated:** institution records, demonstration checklist and issuer responses.
- **Not completed:** live government integration, authoritative coverage of all application categories, cryptographic signature validation and broad representative document evaluation.
- **Test evidence:** 40 API/rule tests and twelve prepared synthetic PDF cases passed. These are different kinds of checks, not a combined accuracy percentage.
- **Verification boundary:** a file hash identifies bytes. It does not prove the document's claims are authentic.
- **Review boundary:** review completion is not statutory approval.
- **Impact boundary:** expected savings and reviewer benefits require a pilot.

## 5. Compact presentation story

1. Introduce the project and the selected problem statement.
2. Explain the wrong-campus evidence problem and our proposed solution.
3. Show how the application processes evidence and previews a correction.
4. Establish feasibility through executed checks and realistic risk handling.
5. Explain the expected benefit for reviewers and institutions.
6. Show the research basis and state our precise contribution.

Keep this as a six-slide story. Use the supporting material in this file to answer questions, not to create extra submission slides.
