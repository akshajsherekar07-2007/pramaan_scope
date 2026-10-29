# PramaanScope - Revised SIH PPT Content

**Team:** CELESTIAL_OUTLAWS  
**Team Leader:** Akshaj Sherekar  
**Problem Statement:** SIH26261  
**Team ID:** __________________  
**Version:** Expanded presentation copy, 27 October 2026

This file provides the wording for the six sections in the supplied SIH template. The main content uses the reference presentations' pattern of a descriptive heading followed by a short, complete explanation. Supporting notes provide additional depth for the presenter.

## Content and sentence style

- **Point structure:** A bold subject label followed by a sentence explaining the feature, its action or its benefit.
- **Sentence length:** Generally 15-25 words per point, with shorter wording for process diagrams and technology labels.
- **Expected line length:** Aim for two lines in a wide column or up to three lines in a narrow column. Actual wrapping depends on the final font size and layout.
- **Section structure:** Group related points under recognizable headings such as Proposed Solution, Key Features, Challenges and Strategies, and Benefits.
- **Slide count:** Six slides in total, including the title slide. Supporting notes below do not represent additional slides.
- **Use of detail:** Keep the main content on the slide. Use supporting notes to explain implementation details and answer questions.

The references differ in density. This version follows their labeled explanations and structured sections without copying their longest paragraphs or their project-specific claims.

---

## SLIDE 1 - TITLE PAGE

### SMART INDIA HACKATHON 2026

## PramaanScope

### Institutional Evidence Review with Correction Impact Tracking

- **Problem Statement ID:** SIH26261
- **Problem Statement Title:** AI-Powered Application Validation, Document Authentication and Regulatory Compliance Verification
- **Organization:** AICTE
- **Theme:** Smart Automation
- **PS Category:** Software
- **Team ID:** __________________
- **Team Name:** CELESTIAL_OUTLAWS
- **Team Leader:** Akshaj Sherekar

### Opening statement - presenter notes

PramaanScope helps authorized reviewers check whether institutional documents support the correct campus, academic period and application requirement. When an institution submits corrected evidence, the application shows which findings and earlier reviews need attention again.

### Visual direction

Preserve the supplied SIH title artwork and logo. Give the product name the strongest emphasis, followed by the full problem statement and registered team details.

### Registration detail to confirm

Confirm the theme against the registered portal entry. Leave the Team ID blank until the team supplies it.

---

## SLIDE 2 - IDEA TITLE AND PROPOSED SOLUTION

### PRAMAANSCOPE

### Evidence Review for the Correct Institution, Campus and Period

### A. Proposed Solution

**PramaanScope is an institutional evidence review platform that checks supporting documents, explains discrepancies and tracks the consequences of corrections. It connects each finding to the evidence and review history behind it.**

### B. Key Features

- **Document Validation:** Compare institution identifiers, campus details, academic periods and declared historical intake across supported application documents.
- **Evidence-Based Explanations:** Display the original page and extracted information beside each finding so reviewers can inspect the reason behind a discrepancy.
- **Targeted Clarification:** Record a specific request identifying the missing or unsuitable evidence and the correction the institution should provide.

### C. Innovation and Differentiation

- **Correction Impact Preview:** Calculate which findings depend on a proposed replacement before the reviewer accepts it into the active application.
- **Review Validity Tracking:** Keep earlier reviews attached to their original evidence versions so changed documents receive the appropriate renewed review.
- **Separate Verification Status:** Distinguish content consistency, source confirmation and human review so a matching field does not imply complete verification.

### D. How It Addresses the Problem

**Example:** The application concerns Campus A, while the submitted certificate names Campus B. PramaanScope flags the scope discrepancy and supports a controlled correction.

### Supporting explanation - presenter notes

1. The problem goes beyond checking whether a document was uploaded. The evidence must support the requirement being reviewed.
2. A certificate can contain the correct institution identifier and valid dates while covering different premises.
3. The reviewer can request: “Provide evidence covering Campus A. The submitted certificate identifies Campus B.”
4. The institution proposes a replacement with a reason. The active evidence remains unchanged until reviewer acceptance.
5. The preview shows changed information, affected findings and earlier review actions that need reconsideration.
6. The system preserves the original document and review history after the correction.

**Positioning:** Our demonstrated distinction is this connected institutional review workflow. OCR, evidence requests and evidence-driven re-evaluation already have commercial precedents.

### Suggested layout

Place the two-sentence proposal across the top. Use the campus illustration beside the example, with the feature and differentiation points grouped on the other side. Give Correction Impact Preview the strongest visual emphasis.

---

## SLIDE 3 - TECHNICAL APPROACH

### TECHNICAL APPROACH

### A. Frontend and Reviewer Workspace

- **React and TypeScript:** Provide a responsive interface for inspecting documents, reviewing findings, handling clarification and comparing proposed corrections.
- **Evidence Workbench:** Bring original pages, extracted fields and reviewer actions into the same workspace for an understandable scrutiny process.

### B. Backend and Validation Engine

- **Node.js and Express:** Handle application requests, enforce role permissions and run the document-validation rules on the server.
- **Rule-Based Evaluation:** Produce twelve findings across evidence readiness, identity, campus applicability, period validity, historical intake and source comparison.

### C. Document Processing and Storage

- **PDF Extraction and Local OCR:** Use pdf-parse for native PDF text and Tesseract.js for supported English images, retaining page references.
- **SQLite and Private Files:** Store document versions, analysis snapshots, clarification requests and reviews while preserving original evidence separately.

### D. Correction Control and Security

- **Dependency and Version Tracking:** Link findings to document versions and bind review actions to a fingerprint of the evidence basis.
- **Protected Access:** Use reviewer and assigned-institution accounts, server sessions and permission checks to restrict actions and private review information.

### E. Implementation Workflow - Diagram Copy

1. **Upload Evidence:** Preserve the submitted file and create its version record.
2. **Extract Information:** Read supported fields and retain their document-page references.
3. **Evaluate Requirements:** Compare active evidence with the demonstration checklist and institutional profile.
4. **Review Findings:** Inspect discrepancies and record a precise clarification request.
5. **Preview Correction:** Compare the candidate with the original and calculate affected findings.
6. **Accept and Reassess:** Activate the replacement, retain history and identify reviews requiring reconsideration.

### Supporting explanation - presenter notes

**The six check groups:**

| Check group | Current behavior |
| --- | --- |
| Evidence readiness | Check required documents and infrastructure-evidence assessment status. |
| Institution identity | Compare the identifier in four document types against the application profile. |
| Campus applicability | Check whether the certificate covers the campus under review. |
| Period and validity | Compare application and previous-approval periods and inspect explicit certificate validity dates. |
| Historical intake | Compare declared previously approved course and intake with previous approval evidence. |
| Source comparison | Display the simulated source result separately from independent verification. |

**How the correction mechanism works:**

- Each finding records its supporting document versions and rule version.
- Each review records the finding fingerprint that the reviewer actually inspected.
- A proposed replacement remains a candidate until acceptance.
- Confirmation checks the application revision and rejects an outdated preview.
- A SQLite transaction updates the active version and related workflow records together.
- The evaluator reruns all current checks. Dependencies identify the impact set and review validity; selective rule execution is not implemented.

**Current processing boundaries:**

- Supported inputs are PDF, PNG and JPEG, with a 10 MB file limit and a ten-page PDF limit.
- The parser targets labeled English fields. Image-only PDFs require page images in the current build.
- Local image OCR is client-produced extraction and remains explicitly unreviewed.
- Source responses are simulated, and cryptographic signature validation is not implemented.
- jsPDF generates the reviewer report.

### Suggested layout

Group the stack into four compact technology sections. Use the six short workflow stages in a diagram, with the actual correction-impact screenshot as evidence of implementation. Keep the detailed check-group table in the presenter notes.

---

## SLIDE 4 - FEASIBILITY AND VIABILITY

### FEASIBILITY AND VIABILITY

### A. Feasibility of the Solution

- **Technical Feasibility:** The prototype combines implemented document extraction, server-side checks, reviewer actions and correction-impact tracking in a working local application.
- **Operational Feasibility:** Defined reviewer and institution roles support evidence submission, clarification and acceptance within one understandable review journey.
- **Local Execution:** SQLite, private file storage and bundled OCR assets allow the demonstration to run without a separate database service or cloud-model key.
- **Implementation Evidence:** Forty API and rule tests passed, and twelve prepared synthetic PDF cases matched their expected outcomes.

### B. Potential Challenges and Strategies

| Challenge | Strategy |
| --- | --- |
| **Document Readability:** Missing fields, ambiguous dates or poor scans can prevent reliable checks. | **Explicit Uncertainty:** Keep results unresolved and provide the original evidence for reviewer inspection. |
| **Review Consistency:** A replacement can change the evidence behind an earlier finding or review. | **Version Controls:** Bind reviews to evidence fingerprints and reject acceptance based on an outdated impact preview. |
| **Source Availability:** Issuer access may be unavailable or unsupported for a document type. | **Verification Transparency:** Show source coverage and outage states and provide a manual follow-up path. |
| **Rule and Format Diversity:** Real applications may use different layouts and category-specific requirements. | **Domain Validation:** Review the checklist with officials and evaluate extraction on representative document packets before expansion. |

### C. Viability Statement

**The local prototype demonstrates the complete correction journey. An institutional pilot requires approved rules, authorized source integrations and representative document evaluation.**

### Supporting explanation - presenter notes

**What the implementation evidence covers:**

- A successful TypeScript/Vite build.
- Forty API/rule tests covering selected extraction, evidence replacement, review preservation, source outages, reporting, authentication and privacy behavior.
- A passing protected browser journey covering reviewer setup, institution access and the correction workflow.
- Twelve deterministic synthetic PDF scenarios using actual native-text extraction.

**Additional risks to discuss if asked:**

- **Access control:** Enforce application assignment for evidence access and filter private reviewer notes from institution responses.
- **Deployment:** Shared institutional use requires production identity management, backup/restore arrangements and deployment hardening.
- **Scanned document diversity:** Expand multipage scanned-PDF handling and evaluate against realistic templates and image quality.
- **Regulatory changes:** Validate category applicability and effective requirements rather than treating the demonstration checklist as authoritative.

**Interpretation of results:** These checks establish selected prototype behavior. They do not measure national deployment accuracy, officer time savings or superiority over a commercial product.

### Suggested layout

Use a compact feasibility section and a challenge/strategy table. Highlight “40 tests” and “12 synthetic cases” beside a readable description of what those figures represent.

---

## SLIDE 5 - IMPACT AND BENEFITS

### IMPACT AND BENEFITS

### A. Potential Impact on the Target Audience

- **Scrutiny Officers:** Support a structured review by presenting applicable evidence, clear discrepancies and the consequences of proposed corrections.
- **Institution Coordinators:** Make clarification requests easier to understand by identifying the exact document, discrepancy and evidence needed for a response.
- **Review Supervisors:** Preserve document versions and review history so the basis of an earlier finding remains accessible after changes.

### B. Administrative and Technical Benefits

- **Focused Reconsideration:** Identify findings linked to changed evidence and show which registered dependencies remain unchanged during the correction process.
- **Traceable Review:** Retain original files, finding snapshots and review reasons to explain how the current application state was reached.
- **Clear Verification Coverage:** Keep content checks, source status and human review separate, including unresolved verification in the exported report.

### C. Social and Operational Benefits

- **Clearer Communication:** Give institutions an actionable explanation of what to correct and reviewers a consistent basis for follow-up.
- **Potential Effort Reduction:** Help reviewers avoid unnecessary repeated scrutiny by making the affected findings visible before accepting corrected evidence.
- **Accessible Demonstration:** Provide a browser-based local workspace that does not require a mandatory cloud-model account to demonstrate the core workflow.

### D. Impact Evaluation

**Pilot measures:** Review time, clarification cycles, missed affected findings, false discrepancy alerts and unsupported acceptance.

### Supporting explanation - presenter notes

These are expected benefits arising from implemented mechanisms. The team has not yet measured staff-time savings, reduced application-processing time, cost savings or user satisfaction in an officer pilot.

**Benefit categories:**

| Category | How the proposed benefit follows from the solution |
| --- | --- |
| Administrative | Requirement-linked findings and explicit next actions provide a repeatable review structure. |
| Technical | Evidence fingerprints and retained versions preserve the distinction between current and historical reviews. |
| Social / service experience | Precise requests can make communication between institutions and reviewers easier to understand. |
| Economic / operational | Better visibility of affected findings could reduce unnecessary rereading and repeated clarification exchanges. |
| Environmental | Digital evidence handling could avoid some duplicate printing, but this effect has not been measured and should remain a secondary point. |

**Example to explain the impact:** A corrected campus certificate changes several dependent findings. The reviewer can see those affected findings directly while retaining the context of unrelated evidence. The workflow supports more deliberate reassessment without erasing earlier work.

### Suggested layout

Separate target-audience impact from benefits. Group benefits under administrative/technical and social/operational headings, following the references' category-based presentation style. Use the reviewer-and-institution illustration alongside the text.

---

## SLIDE 6 - RESEARCH AND REFERENCES

### RESEARCH AND REFERENCES

### A. Research Basis

- **Approval Context:** Examined the problem description and AICTE handbook-release information to align the prototype with institutional application scrutiny and human oversight.
- **Existing Platforms:** Reviewed document-processing and evidence-management documentation to identify established capabilities and avoid presenting ordinary extraction as a new invention.
- **Change and Provenance:** Examined evidence re-evaluation and provenance concepts to guide document dependencies, retained versions and review-validity tracking.
- **Verification Infrastructure:** Studied official document-service and signature guidance to distinguish source confirmation, document applicability and unsupported verification.

### B. Gap and Our Response

**Research gap:** A focused institutional review workflow should connect requirement-specific evidence, precise clarification and the downstream consequences of permitted corrections.

**Our response:** PramaanScope implements that connection through an evidence matrix, candidate-replacement preview, document-version dependencies and preserved human-review history.

### C. Main References for the Slide

1. **AICTE Approval Process Handbook Release - Ministry of Education / PIB**  
   Establishes the existing approval context and handbook baseline.  
   https://www.pib.gov.in/PressReleasePage.aspx?PRID=1983013&lang=2&reg=48

2. **Instabase - Validating Packets**  
   Documents cross-document checks and custom validation functions.  
   https://docs.instabase.com/automate/validating-packets

3. **Diligent - Responding to and Submitting Evidence**  
   Documents evidence requests, review roles and submission history.  
   https://help.diligentoneplatform.com/helpdocs/d1p/en-us/Content/evidence_hub/tasks/respond-to-and-submit-evidence.htm

4. **Kloom - Continuous Due Diligence and KYC**  
   Provides conceptual prior art for evidence-driven re-evaluation.  
   https://kloom.ai/continuous-due-diligence-kyc/

5. **Entity Locker - MeitY / PIB**  
   Describes organizational document sharing, verification and consent features.  
   https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=2094574&lang=2&reg=3

### Supporting explanation - presenter notes

**What we learned from the competitive research:**

| Research observation | Implication for PramaanScope |
| --- | --- |
| Extraction and cross-document matching already exist. | Demonstrate evidence applicability and correction handling instead of claiming novelty for OCR. |
| Evidence requests and review loops already exist. | Make the request specific to the finding, document and unresolved claim. |
| Evidence-driven re-evaluation already has precedents. | State our distinction as the implemented institutional workflow, rather than a worldwide-first concept. |
| Authorized sources have access and document-coverage boundaries. | Clearly label simulations, unavailable services and independent verification gaps. |

**Research limits:** The work consists of public-source desk research and implementation review. It does not include AICTE officer interviews or comparative vendor trials. It does not prove the absence of similar internal AICTE functionality.

**Additional references:**

- [Detailed SIH26261 brief reproduction](https://zaidsayyed.in/tools/sih-problem-statements/sih26261) - third-party reproduction; confirm the complete official brief.
- [Google Document AI](https://cloud.google.com/document-ai) - extraction, classification and processing capabilities.
- [W3C PROV](https://www.w3.org/ns/prov) - provenance and derivation concepts.
- [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/) - verification and reliance on claims.
- [CCA signature verification](https://www.cca.gov.in/index.php/signature_verification.html) - certificate-chain and revocation considerations.
- [DigiLocker NAD verifier process](https://nad.digilocker.gov.in/Verifier) - registration, consent and academic-award availability.
- [Creatrix Campus accreditation management](https://www.creatrixcampus.com/accreditation-management-software) - higher-education evidence workflows.
- [Ocrolus Detect](https://docs.ocrolus.com/docs/detect) - established document-fraud indicators.

### Suggested layout

Use concise research findings with their design implications on one side and five readable, clickable reference titles on the other. Keep full URLs and the extended explanation in speaker notes when they would make the slide crowded.

---

## Reference-style framing applied in this revision

| Pattern observed in the supplied references | How the revised content uses it |
| --- | --- |
| A short proposed-solution explanation introduces the product before feature lists. | Slide 2 opens with two connected sentences defining the application and its purpose. |
| Bold labels introduce complete explanatory points. | Feature, technology, feasibility and benefit points consistently use this structure. |
| Objectives, problem fit and uniqueness appear as separate sections. | Slide 2 distinguishes key features, differentiation and the campus-scope example. |
| Technologies are grouped by system layer. | Slide 3 groups the interface, backend, document processing and correction/security controls. |
| The implementation sequence appears visually. | Slide 3 supplies six short process-stage labels and one explanatory sentence for each. |
| Challenges connect directly to mitigation strategies. | Slide 4 uses four paired challenge-and-response rows. |
| Target-audience impact and categories of benefits are distinct. | Slide 5 separates affected users from administrative, technical and operational benefits. |
| Research references explain the basis of the solution. | Slide 6 connects each research area to a design choice and supplies supporting links. |

## SIH requirement coverage

| Required content | Location in this file |
| --- | --- |
| Problem Statement ID, title, theme and category | Slide 1 |
| Registered team details | Slide 1 |
| Proposed solution and detailed explanation | Slide 2, sections A-B |
| How the solution addresses the problem | Slide 2, section D and presenter notes |
| Innovation and uniqueness | Slide 2, section C; Slide 6, section B |
| Technologies used | Slide 3, sections A-D |
| Methodology and implementation process | Slide 3, section E |
| Working-prototype demonstration | Slide 3 visual and Slide 4 implementation evidence |
| Feasibility and viability | Slide 4, sections A and C |
| Potential challenges and strategies | Slide 4, section B |
| Target audience, impact and benefits | Slide 5, sections A-C |
| Research details and reference links | Slide 6 |

## Submission and claim rules

- Keep the final submission to **six slides including the title**, using the supplied template and its required sections.
- Remove the instructional slide and export a PDF for submission, as stated in the supplied template.
- All main content above belongs within those six slides. Presenter notes provide additional detail and are not extra slides.
- Keep synthetic records and simulated source responses clearly labeled.
- Describe the twelve-case result as prepared synthetic evaluation, not real-world accuracy.
- Do not claim measured cost savings, automatic statutory approval, universal forgery detection or worldwide novelty.
- The application currently provides a local prototype. Live issuer access, cryptographic signature checks and authoritative category-wide rule coverage are not completed features.
