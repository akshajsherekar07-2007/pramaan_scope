"""Build the teammate handover report and its editable Markdown companion."""
from pathlib import Path
from html import escape
import json
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image, KeepTogether
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output' / 'pdf'
OUT.mkdir(parents=True, exist_ok=True)
PDF = OUT / 'PramaanScope-Complete-Team-Summary.pdf'
MD = OUT / 'PramaanScope-Complete-Team-Summary.md'
NAVY = colors.HexColor('#14243b')
TEAL = colors.HexColor('#0f766e')
MUTED = colors.HexColor('#526176')
LINE = colors.HexColor('#dce3ec')
PALE = colors.HexColor('#f1f6f7')
pdfmetrics.registerFont(TTFont('Arial', 'C:/Windows/Fonts/arial.ttf'))
pdfmetrics.registerFont(TTFont('Arial-Bold', 'C:/Windows/Fonts/arialbd.ttf'))
pdfmetrics.registerFontFamily('Arial', normal='Arial', bold='Arial-Bold', italic='Arial', boldItalic='Arial-Bold')
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='BodyReport', fontName='Arial', fontSize=10, leading=14.6, textColor=NAVY, spaceAfter=9))
styles.add(ParagraphStyle(name='SmallReport', fontName='Arial', fontSize=8.3, leading=11.5, textColor=MUTED, spaceAfter=6))
styles.add(ParagraphStyle(name='HeadingReport', fontName='Arial-Bold', fontSize=22, leading=27, textColor=NAVY, spaceAfter=17))
styles.add(ParagraphStyle(name='SubReport', fontName='Arial-Bold', fontSize=12, leading=16, textColor=TEAL, spaceBefore=9, spaceAfter=7))
styles.add(ParagraphStyle(name='CellReport', fontName='Arial', fontSize=9, leading=12.5, textColor=NAVY))
styles.add(ParagraphStyle(name='CellHeadReport', fontName='Arial-Bold', fontSize=9, leading=12.5, textColor=colors.white))
styles.add(ParagraphStyle(name='CalloutReport', fontName='Arial-Bold', fontSize=11, leading=16, textColor=TEAL, spaceAfter=0))

pages = []
def page(title, subtitle=''):
    p = {'title': title, 'subtitle': subtitle, 'blocks': []}
    pages.append(p)
    return p['blocks']
def para(b, text): b.append(('p', text))
def sub(b, title, text): b.extend([('h', title), ('p', text)])
def call(b, text): b.append(('call', text))
def table(b, headers, rows, widths=None): b.append(('table', headers, rows, widths))
def bullets(b, items):
    for item in items: b.append(('bullet', item))
def shot(b, name, caption): b.append(('image', name, caption))

b = page('PramaanScope', 'Complete project, research and implementation handover')
call(b, 'Understand what the evidence supports. Explain what remains unresolved. Show what needs review after a correction.')
para(b, 'A simple-language report for the team building an institutional application and evidence review workspace for SIH26261.')
table(b, ['Project fact', 'Current position'], [
    ['Selected problem statement', 'SIH26261 - AI-Powered Application Validation, Document Authentication and Regulatory Compliance Verification'],
    ['Organization / domain', 'AICTE / technical-institution approval and scrutiny'],
    ['Application', 'PramaanScope - separate from CompliScan and J.U.S.T.I.S.'],
    ['Delivery stage', 'Working local prototype with synthetic records; protected reviewer and institution accounts'],
    ['Strongest demonstration', 'An incorrect campus certificate, a precise clarification, and a replacement preview that identifies affected checks and earlier reviews'],
    ['Report date', '27 October 2026'],
    ['Evidence base', 'Project source, saved tests and evaluation, prior research notes, and refreshed public-source research']
], [135, 376])
sub(b, 'What this report is for', 'A teammate should be able to explain the problem, run the demonstration, understand the architecture, discuss competitors honestly, and see exactly what remains to be built.')
para(b, 'This report describes the current implementation first. Larger production ideas are marked as future work. A local successful check is not an official approval, and a simulated issuer response is not independent authentication.')

b = page('1. Start here', 'The project in everyday language')
para(b, 'A college sends an approval application with several supporting documents. An officer must work out whether the documents belong to that college, cover the correct campus, apply to the relevant year, and support the information the college has declared.')
para(b, 'PramaanScope organizes that review. It reads supported documents, runs clear checks, shows the page behind each finding, and lets the officer request a specific correction. When a replacement arrives, it explains which checks and earlier reviews depend on the old document.')
call(b, 'Our main idea: a document can be readable and still be the wrong evidence for the requirement being checked.')
sub(b, 'Why the earlier problem numbers appear in our history', 'We explored SIH26264, about complaint cases across AICTE bureaus, and SIH26262, about approval workflows and alerts. The application we actually built is for SIH26261, about application validation and document evidence. These are related administrative topics, but they are different deliverables.')
table(b, ['Read this part', 'What you will learn'], [
    ['Sections 2-5', 'The problem, affected users, research findings and opportunity'],
    ['Sections 6-8', 'Government systems, commercial alternatives and our honest positioning'],
    ['Sections 9-13', 'The solution, actual features, MVP limits and interface'],
    ['Sections 14-20', 'Interface, architecture, database, correction logic, access controls and optimization'],
    ['Sections 21-25', 'Tests, earlier-project contributions, roadmap, demonstration, pitch and glossary'],
    ['Sources', 'Public references and project evidence used in the report']
], [135, 376])
para(b, 'Simple vocabulary: evidence means the supporting document; a finding means the result of a check; a dependency means the input that a finding relies on; re-review means inspecting a finding again because its basis changed.')

b = page('2. The problem statement', 'What SIH26261 is asking us to help with')
para(b, 'Title: AI-Powered Application Validation, Document Authentication and Regulatory Compliance Verification. The title is visible in the problem-list screenshot supplied by the team. A detailed public reproduction describes preliminary checks of application records, supporting documents, possible anomalies and authorized-source verification, with officials retaining decisions. [S1]')
para(b, 'In easy words: help an officer understand whether a college has submitted suitable, consistent evidence and which parts still need confirmation. The intended full system would connect to authorized institutional records and applicable rules. [S1]')
sub(b, 'How we translate that into our prototype', 'We built one synthetic institutional application, document intake, six groups of checks, evidence-linked reasons, reviewer actions, a controlled correction journey and a report. These choices are our implementation scope, rather than an authoritative interpretation of every AICTE requirement. [L1-L4]')
table(b, ['Need we address', 'Our chosen demonstration'], [
    ['Find incomplete evidence', 'Required document slots and readable fields'],
    ['Check agreement', 'Institution identifier, campus, year and historical intake'],
    ['Explain a concern', 'A finding with original-page references and a next action'],
    ['Handle verification limits', 'Separate simulated comparison and unresolved source confirmation'],
    ['Support correction', 'Clarification, candidate replacement, impact preview and re-review'],
    ['Keep a human in control', 'Reviewer notes and acceptance; no statutory approval action']
], [162, 349])
sub(b, 'Source confidence', 'We have not independently obtained the complete official SIH brief in this workspace. The detailed reproduction is provisional. The Ministry of Education confirms that an AICTE Approval Process Handbook for 2024-2027 was released; applicable categories and later amendments still require domain validation. [S2]')
para(b, 'Do not treat unrelated technology suggestions on a third-party problem page as official requirements. We have no evidence that blockchain, a mobile app or IoT is mandatory for this build.')

b = page('3. The actual difficulty', 'Who faces it and why a document dashboard alone is insufficient')
table(b, ['Person', 'Question they need answered'], [
    ['Scrutiny officer / reviewer', 'Which requirement is supported, where is the evidence, and what remains unclear?'],
    ['Institution coordinator', 'What exactly should we correct or provide, and where can we submit it?'],
    ['Source or integration administrator', 'Which source can confirm this document, what access is authorized, and what does its response establish?'],
    ['Process owner', 'Can an earlier finding be explained later, including the document version and review behind it?']
], [149, 362])
sub(b, 'The central example', 'Pragati Institute of Technology applies for Campus A. Its submitted safety certificate names Campus B. The institution identifier may be correct and the date may still be current. Nevertheless, the certificate does not establish the campus-specific claim under review. In our application this is a synthetic, deliberately prepared case. [L3]')
sub(b, 'The second difficulty appears after a correction', 'An officer may already have reviewed version 1. If the institution replaces it, the old review should remain in history, but should not appear to approve version 2. The reviewer also needs to know which other findings rely on that certificate, without manually guessing every connection.')
sub(b, 'The third difficulty is uncertainty', 'An unavailable verification source does not tell us that a document is false. A matching institution name does not prove identity. An expired historical approval may still be correct evidence of a previous year. A useful application must explain these distinctions.')
call(b, 'These are practical failure scenarios and design hypotheses. We have not measured how often they occur inside AICTE or how much officer time they consume.')
para(b, 'AICTE already has an approval process. Our proposal is an additional evidence review layer within an authorized process, rather than a claim that institutional approvals are currently entirely manual. [S2; L5]')

b = page('4. What the research established', 'Evidence, interpretation and remaining questions')
para(b, 'Our desk research covered the approval context, government document infrastructure, document extraction platforms, fraud tools, education compliance software, evidence review products and provenance standards. We revisited the most relevant public pages while preparing this report. No vendor trial or AICTE officer interview was conducted. [L5]')
table(b, ['Research finding', 'What it means for us'], [
    ['Document extraction is established', 'Google Document AI offers extraction, classification and splitting. Reading a PDF is a component, not our novelty. [S3]'],
    ['Cross-document rules already exist', 'Instabase supports packet-level validation and custom functions. We cannot claim to invent document comparison. [S4]'],
    ['Evidence requests and resubmission exist', 'Diligent documents scoped requests, submissions, review roles and activity history. A clarification form alone is not unique. [S5]'],
    ['Review after evidence changes exists', 'Kloom advertises evidence-triggered re-evaluation and decisions tied to graph versions. This is close conceptual prior art. [S6]'],
    ['Government verification infrastructure exists', 'Entity Locker supports organizational document exchange and verification; NAD has a registered verifier and consent process for awards. [S7, S8]'],
    ['Provenance has established standards', 'W3C PROV describes derivation and invalidation. Dependency tracking is established engineering. [S9]']
], [161, 350])
sub(b, 'What public research cannot prove', 'A missing feature on a website does not prove it is absent from a product. Public material does not expose AICTE internal deployments, every enterprise configuration or the plans of other SIH teams. We cannot establish a worldwide first or guarantee a win.')
para(b, 'The research supports a specific product opportunity. Its operational value still needs interviews, representative documents and a comparison with an officer\'s current workflow.')

b = page('5. The gap we are targeting', 'A focused opportunity, rather than a claim that nobody has solved it')
call(b, 'Can we connect each requirement to the right evidence, for the right campus and period, and keep the review honest when that evidence changes?')
sub(b, 'Gap A: evidence suitability', 'A file-present check answers whether something was uploaded. A text match answers whether words agree. Our chosen workflow asks whether the uploaded evidence supports the particular requirement for the selected subject and time. Our Campus A / Campus B example makes that difference visible.')
sub(b, 'Gap B: knowing what a correction affects', 'A replacement can affect identity, campus, date and source checks. We register which document versions each finding relies on, show the affected set before acceptance, and keep earlier human reviews attached to their earlier evidence.')
sub(b, 'Gap C: honest verification coverage', 'The interface separates content consistency from issuing-source confirmation and human review. Our fixture can report a match while independent source verification remains unresolved. This prevents a demonstration response from becoming a misleading authenticity badge.')
table(b, ['Strength of the claim', 'Our assessment'], [
    ['Demonstrated engineering opportunity', 'Working correction preview, evidence versions and review validity in our local AICTE-style case.'],
    ['Market positioning opportunity', 'A focused AICTE scrutiny workflow could reduce configuration effort compared with assembling general tools. This is a hypothesis to validate.'],
    ['Unverified operational gap', 'We do not know whether AICTE already handles these cases well internally.'],
    ['Unsupported novelty claim', 'Nobody in the world has built evidence-driven re-review. Kloom and other platforms contradict such a broad claim. [S6]']
], [168, 343])
para(b, 'One narrow research observation: Instabase documents a refresh step after certain input-validation changes. That is a specific documented behavior, not proof that Instabase lacks reprocessing or cannot implement our workflow. [S4]')

b = page('6. Government systems and complements', 'What exists already and where PramaanScope would fit')
table(b, ['Existing system', 'What it provides', 'Our relationship'], [
    ['AICTE approval process', 'An existing handbook-based approval context. [S2]', 'Proposed review layer; no live portal connection has been built.'],
    ['Entity Locker', 'Organization documents, consent-based sharing, government-system integrations and signature-related facilities. [S7]', 'Potential authorized source or exchange service; not something we have replaced.'],
    ['DigiLocker NAD', 'Academic-award verification after registration, consent and availability checks. [S8]', 'Potential source for supported academic records, not every campus certificate.'],
    ['Digital-signature ecosystem', 'Certificate chains and revocation material form part of signature verification. [S10]', 'Future supported validation module; our current hash is not a substitute.']
], [112, 195, 204])
sub(b, 'The layer we propose', 'The portal receives the application. A supported official service may confirm a document or credential. PramaanScope would connect that information to a specific scrutiny requirement, show uncertainty and preserve the basis of the review through corrections.')
sub(b, 'What is actually integrated now', 'No government portal, issuer API, DigiLocker account, Entity Locker service or production identity provider is connected. The current master record and source responses are synthetic. Our adapter records a source label, queried identifier, time, outcome and coverage statement. [L3]')
sub(b, 'Why this matters in the demo', 'We must say: "This source response is simulated; the application demonstrates how the result would be handled." We must not say: "The government has verified this certificate." A future integration needs approved access, supported document coverage and tested fallback behavior.')
para(b, 'A government deployment of one complementary service does not establish government adoption of our application. PramaanScope currently runs on localhost only.')

b = page('7. Competitors and alternatives', 'Document processing and higher-education software')
para(b, 'These are relevant alternatives or adjacent products, not a verified list of AICTE suppliers. The comparisons use publisher descriptions. We have not tested their performance, pricing or complete configurations.')
table(b, ['Alternative', 'What it already does', 'Our intended distinction'], [
    ['Google Document AI [S3]', 'Extracts information; classifies and splits documents.', 'An officer-facing AICTE-style evidence and correction journey. Google processing could also be a future component.'],
    ['Instabase [S4]', 'Cross-document validation, custom logic, external checks and human-review results.', 'Prebuilt institutional scope checks and visible replacement/review handling. Instabase could plausibly be configured similarly.'],
    ['Ocrolus Detect [S11]', 'Document fraud signals with contextual and visual information, exposed through API/dashboard.', 'We focus on requirement suitability and review history. Our basic mismatch flags are much less sophisticated fraud analysis.'],
    ['Creatrix Campus [S12]', 'Accreditation data collection, criteria mapping, workflows, delegation, integration and reporting.', 'Our current case centers on scrutiny of submitted evidence and the effect of corrections. Feature overlap is substantial.']
], [109, 193, 209])
sub(b, 'How we could compete', 'We could offer a narrowly configured demonstration, transparent source status, and a consistent review journey without cloud setup for the local build. We have not established that this is cheaper, faster or more accurate than these products.')
call(b, 'The useful comparison is task fit and demonstrated behavior. It would be inaccurate to say these platforms cannot build our feature set.')
para(b, 'For a pilot, compare the same representative packet in a manual workflow, an extraction-only baseline and our workflow. That would show whether the additional structure actually helps reviewers.')

b = page('8. The closest conceptual competition', 'Evidence management and review after changes')
table(b, ['Alternative', 'Relevant public capability', 'Our position'], [
    ['Diligent Evidence Hub [S5]', 'Evidence requests with scope dates, role-aware collaboration, AI completeness support, submission and review history.', 'Our correction preview links the proposed replacement to named findings and earlier reviews in one institutional case. General request/review loops are established.'],
    ['Vanta Audit [S13]', 'Evidence collection and auditor collaboration for audit readiness.', 'We target institutional document applicability. We have not demonstrated superiority in audit automation.'],
    ['Kloom [S6]', 'Advertises continuous evidence-driven re-evaluation and decisions anchored to evidence graph versions.', 'Closest prior art to the central idea. Our difference is the AICTE-oriented subject, time and permitted-correction workflow, not the invention of change-triggered review.'],
    ['CUBE RegPlatform [S14]', 'Connects regulatory changes, obligations, controls and evidence.', 'We currently implement a small document-checking case, not a global regulatory intelligence platform.']
], [109, 208, 194])
sub(b, 'What we can honestly say is better for our demo', 'Our prototype brings the requirement matrix, page evidence, precise clarification, candidate preview and review validity into one coherent journey. The behavior runs in the application and can be inspected in source and tests. This is a demonstrated property of our build, not an independently measured advantage over the vendors.')
sub(b, 'What would create a defensible advantage later', 'A reviewed AICTE rule pack, authorized source adapters, representative difficult cases, measured reviewer benefits and reliable handling of legitimate exceptions would be harder to copy than a generic AI feature list. These are future assets to develop.')
para(b, 'Our current application has narrower extraction, deployment and integration coverage than mature platforms. The report therefore makes no universal claim that we are better than every competitor.')

b = page('9. Our solution and approach', 'Three connected capabilities')
table(b, ['Capability', 'What the user sees', 'Why it is useful'], [
    ['Show the evidence', 'A requirement row, its current result, original page and extracted assertion.', 'The officer can inspect why a check produced its result.'],
    ['Explain unresolved items', 'A precise reason, separate source status and a recommended next action.', 'The institution knows what needs clarification.'],
    ['Track the effect of corrections', 'Before/after fields, dependent findings and earlier review actions affected by a candidate.', 'The reviewer can reassess the right work after acceptance.']
], [124, 200, 187])
sub(b, 'Our processing approach', 'Upload original -> extract supported fields -> run server checks -> show evidence-linked findings -> record review -> request clarification -> propose replacement -> calculate impact -> reviewer accepts -> reassess against the new evidence.')
sub(b, 'Where AI is used today', 'Tesseract performs local image OCR. Native PDF text extraction and labeled-field parsing produce structured facts. Deterministic TypeScript rules perform the current comparisons. There is no connected cloud LLM, trained AICTE classifier or autonomous regulatory decision engine.')
sub(b, 'Where an LLM could help later', 'A constrained model could propose document categories, extract less structured fields or draft a clarification with page references. Outputs would still need schema checks, uncertainty handling and human correction. Access, rule selection and replacement acceptance should remain controlled by the application.')
call(b, 'The current value comes from evidence handling and workflow correctness. The project does not depend on a secret prompt or an AI answer that another team cannot obtain.')
para(b, 'W3C credential guidance supports the distinction between checking a credential and deciding whether its claims meet a particular verifier\'s needs. That is conceptual support for our design, not proof of a missing market product. [S15]')

b = page('10. The complete example', 'What happens in the working demonstration')
para(b, 'All institution names, identifiers and documents below are synthetic. The application is PS-2026-0042, Pragati Institute of Technology, PIT-042, Campus A, academic year 2026-27. The previous approval period is 2025-26, with B.Tech Computer Science and 60 previously approved seats. The fixed reference date is 27 October 2026. [L3]')
table(b, ['Step', 'Action and outcome'], [
    ['1. Inspect the packet', 'Four required PDFs are parsed. The officer opens a certificate that names Campus B.'],
    ['2. Understand the discrepancy', 'The campus check flags that it does not support the Campus A application. Date consistency and source status remain separate.'],
    ['3. Preserve the review', 'The officer records a note against the current finding and its evidence fingerprint.'],
    ['4. Ask for exact evidence', 'The officer requests evidence covering Campus A and explains that version 1 identifies Campus B.'],
    ['5. Propose a replacement', 'The institution uploads a corrected certificate with a reason. It remains a candidate.'],
    ['6. Preview the impact', 'The system compares assertions and identifies findings relying on the old certificate and earlier review actions attached to them.'],
    ['7. Accept and reassess', 'The reviewer accepts against the current application revision. Original and replacement remain accessible.'],
    ['8. Complete the journey', 'The current campus result changes. Earlier reviews stay historical. Source verification can remain unresolved. The reviewer exports a report.']
], [122, 389])
para(b, 'For the seeded certificate dependency set, five findings depend on it and seven do not. Those figures are calculated from registered inputs; they are not a fixed promise for every future rule pack. Earlier review counts depend on the actions recorded during that session.')
para(b, 'A simulated matching source does not prove that the Campus B certificate is genuine. The demo establishes wrong-scope handling even without any independent authenticity conclusion.')

b = page('11. Major features delivered', 'The actual local application')
table(b, ['Area', 'Working behavior'], [
    ['Document intake', 'PDF, PNG and JPEG; 10 MB file limit; byte-type checks; generated private paths; original preservation and versions.'],
    ['Extraction', 'Native PDF text with page references; original-page previews; local English image OCR using bundled assets.'],
    ['Evidence matrix', 'Twelve findings across six groups; reasons, page evidence, next actions, source state and human review.'],
    ['Review workspace', 'Evidence and findings side by side; reviewer notes, clarification, manual-verification notes and inspection recommendations.'],
    ['Rectification', 'Open clarification required; replacement reason; candidate extraction; comparison before activation; reviewer acceptance.'],
    ['Review validity', 'Finding fingerprints tie actions to the evidence basis; old actions remain visible as historical after changes.'],
    ['Source workflow', 'Explicit matching, mismatching and unavailable fixtures; attempt history; independent verification remains unresolved.'],
    ['Infrastructure', 'Supporting image slot, readiness and manual assessment; no automatic physical certification.'],
    ['History and reporting', 'Saved analysis snapshots, events, old versions, review actions and generated PDF report.'],
    ['Protected access', 'One-time reviewer setup, institution provisioning, sessions, assigned-application checks and private-note filtering.'],
    ['Interface', 'Four responsive views, consistent colors and typography, labeled controls, focus states, loading and error feedback.']
], [117, 394])
para(b, 'The default demo permits persona switching and synthetic reset. Protected mode uses real server-checked accounts and disables the reset endpoint. Neither mode connects to a government service. [L1-L4]')

b = page('12. The six check groups', 'Twelve current findings, explained simply')
table(b, ['Group / count', 'What is checked', 'An important boundary'], [
    ['Evidence readiness / 2', 'Required documents; infrastructure evidence assessment.', 'A readable upload does not establish all required content or physical compliance.'],
    ['Institution identity / 4', 'Institution ID in application, previous approval, certificate and undertaking against the profile.', 'A conflicting or missing ID stays unresolved; matching text is not issuer verification.'],
    ['Campus applicability / 1', 'Certificate campus against application campus.', 'A mismatch indicates unsuitable evidence, not proof of forgery.'],
    ['Period and validity / 3', 'Application year, historical approval year and explicit certificate validity dates.', 'The previous approval is assessed for its expected historical year. Ambiguous dates stay unresolved.'],
    ['Historical intake / 1', 'Declared earlier course and numeric intake against earlier approval.', 'Requested future intake is not treated as a historical declaration.'],
    ['Source comparison / 1', 'Fixture result for the certificate identifier, separately displayed.', 'Every fixture remains unresolved for independent verification, including a simulated match.']
], [120, 191, 200])
sub(b, 'Result meanings', 'PASS means the particular content or readiness check is consistent with the demonstration rule. DEFICIENCY means that rule found a concrete discrepancy. UNRESOLVED means the system lacks sufficient clear evidence. None of these is a final AICTE decision.')
para(b, 'Duplicate original-file bytes can trigger a warning. The warning indicates identical bytes, not intent, misconduct or a copied certificate from another institution. The current implementation does not include a general metadata-forensics or image-tampering model.')
para(b, 'The checklist is implemented in server code under rule version demo-2026.1. A reviewed rule-authoring interface and coverage of every official application category are future work. [L3]')

b = page('13. MVP scope and honest boundaries', 'Working, simulated and still planned')
table(b, ['Status', 'Included capabilities'], [
    ['Working locally', 'Evidence upload and original rendering; selected-field extraction; local image OCR; six check groups; clarification; candidate preview; acceptance; historical reviews; accounts; privacy filtering; report export.'],
    ['Synthetic / simulated', 'Institution master, application packet, demonstration rules and issuing-source match/mismatch/unavailable responses.'],
    ['Manual assistance', 'Original evidence inspection, reviewer notes, source-confirmation notes, infrastructure assessment and inspection recommendation.'],
    ['Planned / not implemented', 'Live AICTE integration, authorized issuer connections, cryptographic signature checks, broad document classification, general scanned-PDF OCR, production multi-tenancy and representative officer evaluation.']
], [126, 385])
sub(b, 'What documents it handles well today', 'Clearly labeled English demonstration fields such as Institution ID, Campus, Academic Year, Approval Period, Course, Approved Intake and certificate validity. PDFs may have at most ten pages. Scanned PDFs without native text need page images in the current build.')
sub(b, 'What should not be claimed', 'We do not have universal forgery detection, photo-based floor-area measurement, statutory approval automation, immutable externally witnessed audit logs or national document coverage. A manually recorded verification note does not turn a simulated connector into a live issuer service.')
sub(b, 'A detail developers should know', 'The data type includes a MANUAL fact method, but there is no completed general field-correction API or editor in this build. Do not describe a planned field-correction workflow as delivered. The current correction journey replaces a document through clarification.')
call(b, 'The local MVP is implemented. The complete real-world scope of SIH26261, including authoritative rules and authorized integration, remains unfinished.')

b = page('14. UI and user experience', 'A professional review workspace with visible evidence')
shot(b, 'overview-focus.png', 'Saved demonstration view: overview and requirement matrix using synthetic records. This capture predates protected accounts and the latest username-label change.')
para(b, 'The visual system uses navy for structure, teal for primary actions, white work surfaces and a light background. Locally bundled Inter keeps typography consistent without an external font request. Status labels use text as well as color. [L2]')
table(b, ['View', 'Purpose'], [
    ['Overview', 'Application identity, actionable alerts and the requirement-evidence matrix.'],
    ['Documents', 'Original file, rendered pages, extracted assertions, OCR and version history.'],
    ['Review', 'Finding, evidence, note and next reviewer action in context.'],
    ['Changes', 'Candidate replacement, old/new fields, impact and acceptance.']
], [102, 409])
para(b, 'The layout adapts to desktop and mobile. Error, loading and empty states are implemented. Accessibility scans and responsive browser scenarios exist, but are not an accessibility certification. Reports remain a persistent action rather than another major navigation view.')

b = page('15. The interaction that stands out', 'Correction impact is visible before acceptance')
shot(b, 'impact-details-focus.png', 'Saved demonstration view: original and candidate evidence with calculated impact. Counts reflect the captured synthetic session.')
sub(b, 'What a reviewer can inspect', 'The proposed file, its original predecessor, changed extracted fields, findings that depend on the predecessor, earlier reviewed actions affected, and findings with unchanged registered dependencies.')
sub(b, 'Why the preview matters', 'The institution can propose evidence without silently changing the active application. The reviewer sees the consequences first. If the application changes after the preview, confirmation is rejected until the impact is refreshed.')
sub(b, 'Why old reviews remain visible', 'A previous review is part of the history. Removing it would hide what was actually checked. Treating it as current after replacement would be misleading. PramaanScope keeps it and distinguishes its earlier evidence basis.')
para(b, 'The application calculates these relationships. This is a working workflow, rather than a prewritten success screen. Its advantage over a competitor still requires a direct comparison on the same task.')

b = page('16. Technology stack and architecture', 'What we use today and why')
table(b, ['Layer', 'Current selection', 'Purpose'], [
    ['Interface', 'React 19, TypeScript, Vite', 'Interactive workspace, typed shared models and production frontend build.'],
    ['Design', 'Native CSS tokens, Inter, Lucide', 'Consistent spacing, typography, colors and icons.'],
    ['Server', 'Node.js 24.15+ and Express 4', 'Same-origin application API and frontend serving.'],
    ['Validation / uploads', 'Zod 4 and Multer 2', 'Validate requests and enforce file limits.'],
    ['Database', 'SQLite through node:sqlite', 'Local persistence, prepared SQL and atomic state transitions.'],
    ['Files / identity', 'Private filesystem and Node crypto', 'Original bytes, generated names, SHA-256, passwords and sessions.'],
    ['PDF processing', 'pdf-parse 2.4.5', 'Actual text extraction and original-page rendering.'],
    ['Image OCR', 'Tesseract.js 5 with local English data', 'Read image text on demand, using a reused worker.'],
    ['Application reports', 'jsPDF 4', 'Export the evidence review report.'],
    ['Checks / verification', 'TypeScript rules, Node test runner, Playwright, axe', 'Deterministic checks and automated workflow/accessibility tests.']
], [100, 179, 232])
para(b, 'Architecture: browser -> Express API -> access checks -> document/rule/store services -> SQLite and private originals. PDF processing runs on the server. Image OCR runs locally in the browser, then the server parses submitted text and evaluates rules. Browser OCR text is labeled client-produced, not independently verified. [L2-L4]')
para(b, 'No Python service, cloud model, Redis, graph database or separate database server is required to run the application. This summary PDF is generated with Python/ReportLab as a documentation tool; that does not change the application stack.')

b = page('17. Database and evidence model', 'SQLite now; a migration path for a larger deployment')
para(b, 'We chose SQLite for a small local prototype because it runs without a separate database service and supports transactions. The prototype uses prepared statements and WAL mode. Most domain objects are stored as JSON payloads in relational tables. [L3]')
table(b, ['Table / record', 'What it preserves'], [
    ['application', 'Institution, campus, cycle, reference date, application revision and workflow state.'],
    ['documents', 'Version ID, slot, predecessor, original hash, state, extraction status, pages and assertions.'],
    ['runs', 'Analysis snapshots with the application revision and calculated findings.'],
    ['reviews', 'Finding key, evidence fingerprint, action, reviewer note, actor and time.'],
    ['clarifications', 'Specific request, related finding/document slot and open/responded state.'],
    ['source_attempts', 'Simulated query identifier, source, outcome, time and declared coverage.'],
    ['settings / events', 'Infrastructure assessment and local action history.'],
    ['auth_users / auth_sessions', 'Account roles and assignment, salted password hashes and hashed session tokens.'],
    ['auth_limits / auth_meta', 'Persistent sign-in throttling and setup-related metadata.']
], [157, 354])
sub(b, 'Files are separate from metadata', 'Originals are stored under generated identifiers in a private local directory and served through authorized API routes in protected mode. The original bytes are not replaced in place when an institution proposes a correction.')
sub(b, 'What changes for production', 'PostgreSQL would support a normalized multi-application model, richer queries and operational scaling. Private object storage would hold versioned originals. That migration needs deliberate schema, authorization, retention, backup and restore work; it is not already implemented.')
para(b, 'The current local event history is useful for explanation but is not an independent, tamper-proof audit system. A privileged local operator can modify local storage.')

b = page('18. How correction tracking works', 'The engineering behind the flagship feature')
table(b, ['Step', 'Implemented behavior'], [
    ['Register inputs', 'Each finding contains document-version dependencies, a rule version and relevant extra inputs such as reference date or fixture state.'],
    ['Create a fingerprint', 'A SHA-256 fingerprint describes the finding payload, including dependencies. A review stores that fingerprint.'],
    ['Keep candidate separate', 'A proposed replacement is CANDIDATE. The old version stays ACTIVE while the reviewer inspects the proposal.'],
    ['Calculate preview', 'Evaluate a hypothetical packet with the candidate active, compare extracted fields, and select current findings that reference the old document.'],
    ['Check concurrency', 'Confirmation supplies the application revision seen in the preview. A changed revision produces a conflict response.'],
    ['Commit together', 'In one SQLite transaction, mark the old version SUPERSEDED, activate the candidate, respond to clarification and update the application.'],
    ['Recalculate and retain', 'Evaluate checks again; save a new snapshot; keep original documents, reviews and the replacement event.']
], [129, 382])
sub(b, 'Conservative dependencies', 'The current implementation tracks dependencies at document level. Even if a replacement changes only its campus, other findings using the same certificate are included. A harmless rescan also creates a new document identity, so earlier reviews are not silently transferred.')
sub(b, 'An optimization claim to avoid', 'The small prototype reruns the complete deterministic evaluator. It uses dependencies and fingerprints to identify impact and distinguish current reviews; it does not yet run only the affected rule functions. Selective execution can be added later when the rule set grows.')
para(b, 'The preview counts earlier review actions linked to affected findings. That number is not necessarily the number of distinct reviewers. Absence from the affected set means unchanged registered dependencies, not an unlimited guarantee that every conceivable policy dependency has been modeled.')

b = page('19. Accounts, roles and privacy', 'The protected local workspace')
para(b, 'Protected mode is separate from the easy-to-reset demonstration. The user creates the first reviewer once. That reviewer can provision institution accounts for the one supported application. Setup closes after the first reviewer exists. [L4]')
table(b, ['Action', 'Reviewer', 'Assigned institution'], [
    ['See assigned application evidence and findings', 'Yes', 'Yes'],
    ['See clarification and current review status', 'Yes', 'Yes'],
    ['Read private notes, internal events and report', 'Yes', 'No'],
    ['Submit permitted evidence / candidate', 'Yes', 'Yes'],
    ['Request clarification / accept replacement', 'Yes', 'No'],
    ['Record assessment / complete review', 'Yes', 'No'],
    ['Create or disable institution accounts', 'Yes', 'No']
], [301, 94, 116])
sub(b, 'Current easy setup rules', 'Username or email: 3-100 characters, without a special format restriction. Password: 6-128 characters, with no uppercase, number or symbol requirement. There is no first-run key. These are the current prototype choices requested by the team.')
sub(b, 'Implemented server controls', 'Passwords use salted scrypt hashes. Random session tokens are stored as hashes on the server; the browser receives an HttpOnly, SameSite=Strict cookie. Authenticated writes check CSRF and origin. Sessions expire after 30 minutes of inactivity or eight hours in total. Sign-out and account disabling revoke sessions.')
para(b, 'The server checks application assignment for document access too, and filters institution responses. It does not trust a browser-selected role in protected mode. Recovery, self-service password changes, SSO/MFA, additional reviewer administration and full multi-application tenancy remain future work.')
para(b, 'The service is bound to localhost HTTP. Public hosting requires a separate deployment configuration with HTTPS and operational controls. The current account system establishes local access, not an officially verified institutional identity.')

b = page('20. Optimization and code organization', 'What has actually been optimized')
table(b, ['Choice', 'Practical effect'], [
    ['Load OCR on demand', 'Avoids loading the OCR engine until the user needs image extraction.'],
    ['Reuse OCR worker', 'Avoids repeating worker/model startup for each image.'],
    ['Bundle model assets locally', 'The demonstrated English OCR workflow does not require external HTTP requests or a cloud key.'],
    ['Bounded page cache', 'Reuses rendered original pages while limiting retained cache entries.'],
    ['Deduplicate concurrent renders', 'Requests for the same page can share in-progress work.'],
    ['Serve frontend and API together', 'A single localhost origin keeps startup and session handling simple.'],
    ['Validate limits early', 'File size/type and PDF page limits bound processing work.'],
    ['Use SQLite transactions', 'Keeps related replacement updates consistent.'],
    ['Limit password-work concurrency', 'Bounds expensive concurrent password hashing.']
], [170, 341])
sub(b, 'How the source is divided', 'client/App.tsx contains the main views; client/Access.tsx handles account screens; client/ocr.ts manages OCR. server/index.ts owns routes and request permissions; server/documents.ts extracts/renders PDFs; server/rules.ts parses fields and evaluates rules; server/store.ts preserves workflow records; server/auth.ts manages identity; server/report.ts exports reports. shared/types.ts defines common structures.')
sub(b, 'Where it still needs engineering growth', 'The evaluator runs all current checks. SQLite access is synchronous and the store reads small object sets in memory. These are acceptable prototype choices, not a measured national-scale architecture. A worker queue, paging, normalized queries and latency/load measurements would be justified as volume grows.')
para(b, 'The production frontend build and functional tests pass. We have not measured p95 latency under concurrent institutional load, maximum throughput, hosted uptime or cost per real application. Avoid saying the application is fully optimized for every deployment.')

b = page('21. Verification and results', 'What our evidence proves, and its limits')
para(b, 'The latest username/email change was followed by a successful TypeScript/Vite build, 40 passing API/rule tests and one passing protected browser journey. Saved project verification also records six browser scenarios covering the broader interface and workflows. [L6]')
table(b, ['Evidence', 'What was checked', 'What it does not establish'], [
    ['40 API / rule tests', 'Extraction, correction gating, preview conflicts, retained reviews, source outage, reports, roles, privacy, sessions and account lifecycle.', 'All official regulatory rules or production security assurance.'],
    ['Protected browser journey', 'Keyless setup, email usernames, account roles and complete correction flow.', 'Identity verification by AICTE or nationwide deployment.'],
    ['Saved six-scenario browser suite', 'Responsive views, accessibility scans, local OCR and main flows.', 'Accessibility certification or every browser/device.'],
    ['12 synthetic PDF cases', 'Expected and observed outcomes match on prepared examples using actual PDF extraction.', 'Population accuracy, held-out generalization or officer time savings.'],
    ['Video / screenshots / slides', 'A recorded local workflow and submission materials exist.', 'A live production service or current portal submission acceptance.']
], [122, 208, 181])
sub(b, 'Synthetic evaluation details', 'The cases include wrong/correct campus, wrong institution, expired certificate, ambiguous and impossible dates, historical approval, wrong approval period, historical intake mismatch, missing certificate, source outage and a simulated source match. All twelve expected outcomes matched. [L7]')
para(b, 'The simulated match correctly remains unresolved for independent source verification. That result demonstrates the status boundary, rather than issuer authenticity. Test timings from these tiny fixtures should not be presented as production processing speed.')
call(b, 'Say "12 prepared synthetic cases passed," not "100% accurate on real AICTE applications."')

b = page('22. What CompliScan and J.U.S.T.I.S. contribute', 'Useful experience, with a new application and domain model')
para(b, 'CompliScan was built for legal metrology and packaged-commodity compliance. Its local OCR, structured findings, evidence fingerprints, original evidence inspection, review and reporting patterns helped shape this project. The research notes identify the corresponding source areas in its checkout. [L5]')
table(b, ['Prior experience', 'How it helps PramaanScope', 'What had to change'], [
    ['Local image OCR', 'Worker and bundled-asset approach.', 'Institution documents and PDF handling.'],
    ['Structured compliance checks', 'Readable rule findings and next actions.', 'New identity, campus, period and intake rules on the server.'],
    ['Original evidence hashes', 'Identify exact file bytes and preserve originals.', 'Document versions and clear authenticity limits.'],
    ['Review and history', 'Officer inspection, notes and report concepts.', 'Review fingerprints, clarification and candidate acceptance.'],
    ['Supervision experience', 'Awareness of actor identity and revision changes.', 'Protected local accounts and institution privacy filtering.']
], [132, 181, 198])
sub(b, 'What was not copied', 'Packaging rules, barcode calibration, product scanning and map features do not solve this institutional evidence problem. The main PramaanScope interface and evidence model are separate. The current project documentation states that the CompliScan checkout was kept unchanged. [L1]')
sub(b, 'J.U.S.T.I.S. in this report', 'J.U.S.T.I.S. was part of our earlier discussion about case-related problem statements. The current PramaanScope implementation evidence does not establish direct reuse of its code. We therefore describe it as earlier team context, not as a shipped PramaanScope module.')
para(b, 'The advantage from earlier projects is practical knowledge of handling evidence and reviews. It is not proof that a legal-metrology or justice system already implements AICTE approval validation.')

b = page('23. Roadmap and next implementation work', 'Turning the local demonstration into a credible pilot')
table(b, ['Priority', 'Next deliverable', 'Evidence of completion'], [
    ['1. Validate scope', 'Obtain official brief; select category; review current handbook/amendments and a small checklist with a domain reviewer.', 'Every rule maps to an accepted source and applicability condition.'],
    ['2. Test representative packets', 'Collect authorized or realistic sample layouts; include legitimate aliases, shared-trust documents and difficult negatives.', 'A labeled evaluation with document/template separation and recorded failures.'],
    ['3. Add source coverage', 'Choose one available authorized issuer route; document consent, identifiers, supported assertions and fallback.', 'Real response provenance plus unavailable, unsupported and mismatch tests.'],
    ['4. Add signature validation', 'Support a declared signature profile with trust chain, signing-time and revocation handling.', 'Known valid/invalid/unsupported signed samples and explicit results.'],
    ['5. Improve extraction', 'Scanned multipage PDF processing, robust layout extraction and a recorded field-correction flow.', 'Page-linked facts across representative formats with measured errors.'],
    ['6. Prepare shared deployment', 'PostgreSQL, private object storage, multi-application access, recovery and backups.', 'Cross-tenant denial, restore tests and a deployment review.'],
    ['7. Measure reviewer benefit', 'Compare manual, extraction-only and full-workflow review on the same tasks.', 'Paired time/error outcomes, limitations and reviewer feedback.']
], [102, 237, 172])
para(b, 'For an initial study, the earlier research proposed 60 synthetic or authorized packets: 20 for development and 40 held out, separated by institution/template family. That study has not been run. The current executed evaluation contains twelve deterministic synthetic cases only. [L5, L7]')
para(b, 'Track extraction error, false discrepancy alerts, unsupported passes, missed affected findings and source-outage behavior separately. A useful improvement must reduce review burden without hiding uncertainty or increasing incorrect acceptance.')

b = page('24. Run, demonstrate and explain it', 'A practical teammate handover')
sub(b, 'Open the protected application', 'From the pramaanscope directory use Node.js 24.15 or newer. Install with npm ci if needed, then npm run build. Double-click Start Protected PramaanScope.cmd and open http://127.0.0.1:47263. Create the first reviewer only if setup is shown; otherwise use your existing account. There are no default credentials. [L1, L4]')
sub(b, 'Choose the right workspace', 'Port 47263 uses .pilot-data/pramaanscope.sqlite and .pilot-data/originals. Port 47261 is the separate synthetic demo using data/. Older CompliScan ports such as 4177 are not this application. Keep the terminal running while demonstrating.')
sub(b, 'A clear three-minute story', 'Start with the matrix and Campus A application. Open the Campus B certificate and its page evidence. Record the review, ask for Campus A evidence, propose the corrected sample and open Changes. Explain the calculated impact, accept it as reviewer, show earlier evidence history, then show unresolved source verification and export the report.')
sub(b, 'A pitch the evidence supports', '"PramaanScope helps an officer see what each requirement is supported by, request the exact missing evidence, and understand which earlier reviews need attention after a permitted correction."')
table(b, ['Likely question', 'Honest answer'], [
    ['Is this completely new?', 'The components and broad concept have prior art. Our delivered distinction is the focused institutional workflow.'],
    ['Is the source really verified?', 'Not in this prototype. Source responses are visibly simulated.'],
    ['Can it approve a college?', 'It supports review. Final statutory decisions remain with authorities.'],
    ['Why will it stand out?', 'A coherent working demonstration and evidence of correct behavior can strengthen the entry. Selection is not guaranteed.']
], [155, 356])
para(b, 'Existing video, slides and screenshots are saved in submission/. Some were captured before protected accounts and the final simplified username form; explain the live application as the current version. Confirm the official portal template and submission limits before uploading.')

b = page('25. Quick glossary', 'Plain words for the team')
table(b, ['Term', 'Easy meaning'], [
    ['AICTE / EoA', 'The technical-education regulator / Extension of Approval.'],
    ['MVP', 'The smallest coherent version that demonstrates the intended value.'],
    ['OCR', 'Reading text from a photograph or scanned image.'],
    ['Extraction / assertion', 'A value read from a document, along with where and how it was found.'],
    ['Requirement / finding', 'What needs support / the result of checking its evidence.'],
    ['Scope / applicability', 'Which institution, campus, period or subject the evidence actually covers.'],
    ['Provenance', 'Where information came from and how a result was derived.'],
    ['Dependency', 'An input that a finding relies on, such as a particular certificate version.'],
    ['Hash / fingerprint', 'A digital identifier for bytes or a finding payload. It is not proof that the underlying claim is true.'],
    ['Candidate / active / superseded', 'Proposed replacement / current evidence / earlier retained evidence.'],
    ['Stale review', 'An earlier review whose evidence basis has changed and needs reconsideration.'],
    ['Fixture', 'A controlled synthetic response used to demonstrate or test behavior.'],
    ['Authentication / authorization', 'Who is signed in / what that account is allowed to do.'],
    ['CSRF protection', 'A check that helps stop another site from causing unwanted signed-in actions.'],
    ['Transaction / revision', 'A group of database updates committed together / a number identifying the current application state.'],
    ['Source confirmation', 'A defined assertion returned by an authorized source; its coverage must be stated.']
], [153, 358])
para(b, 'Remember the three questions: Is the content consistent? Has an appropriate source confirmed it? Has a human reviewed this exact evidence basis? The application keeps those answers distinct.')

references = [
('S1', 'SIH26261 detailed brief reproduction - provisional, third-party', 'https://zaidsayyed.in/tools/sih-problem-statements/sih26261', 'Problem title and reproduced scope. Official full brief still needs confirmation; promotional recommendations are excluded.'),
('S2', 'Ministry of Education / PIB - AICTE handbook release', 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=1983013&lang=2&reg=48', '6 December 2023. Confirms the 2024-2027 handbook release and existing approval context; not a current validated rule pack.'),
('S3', 'Google Cloud - Document AI', 'https://cloud.google.com/document-ai', 'Publisher description of extraction, classification, splitting and OCR.'),
('S4', 'Instabase - Validating packets', 'https://docs.instabase.com/automate/validating-packets', 'Cross-document validation, custom functions, human review and documented refresh behavior.'),
('S5', 'Diligent - Responding to and submitting evidence', 'https://help.diligentoneplatform.com/helpdocs/d1p/en-us/Content/evidence_hub/tasks/respond-to-and-submit-evidence.htm', 'Evidence scope, roles, activity history, submission and AI completeness workflow.'),
('S6', 'Kloom - Continuous due diligence and KYC', 'https://kloom.ai/continuous-due-diligence-kyc/', 'Advertised evidence-triggered re-evaluation and graph-version decision basis. Close conceptual prior art; no product trial.'),
('S7', 'MeitY / PIB - Entity Locker', 'https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=2094574&lang=2&reg=3', '20 January 2025. Organizational document sharing, verification and consent features.'),
('S8', 'DigiLocker NAD - Verifier', 'https://nad.digilocker.gov.in/Verifier', 'Verifier registration, consent and award-availability process.'),
('S9', 'W3C - PROV namespace', 'https://www.w3.org/ns/prov', 'Established provenance concepts and vocabulary, including derivation and invalidation.'),
('S10', 'Controller of Certifying Authorities - Signature verification', 'https://www.cca.gov.in/index.php/signature_verification.html', 'Certificate-chain and revocation material; supports the distinction between hashes and signature validation.'),
('S11', 'Ocrolus - Detect documentation', 'https://docs.ocrolus.com/docs/detect', 'Publisher documentation of document-fraud indicators, context and API/dashboard availability.'),
('S12', 'Creatrix Campus - Accreditation management', 'https://www.creatrixcampus.com/accreditation-management-software', 'Publisher-indexed content: criteria mapping, workflow, delegation and reporting. Direct retrieval returned 502; feature descriptions were available in search.'),
('S13', 'Vanta - Audit product', 'https://www.vanta.com/products/audit', 'Publisher description of evidence collection and audit collaboration; vendor savings claims are not adopted here.'),
('S14', 'CUBE - RegPlatform', 'https://www.cube.global/products/regplatform', 'Publisher description of regulatory obligations, controls and evidence mapping.'),
('S15', 'W3C - Verifiable Credentials Data Model v2.0', 'https://www.w3.org/TR/vc-data-model/', 'Conceptual distinction between verification of credentials and a verifier\'s reliance on claims.')
]
b = page('26. Public research sources', 'References S1-S8; refreshed 27 October 2026')
para(b, 'Numbered references identify the source behind research claims. Publisher capabilities are not independent performance results. Links are clickable. No public-source absence is used to prove that a product cannot implement a feature.')
for ident, title, url, note in references[:8]:
    b.append(('ref', ident, title, url, note))
b = page('27. Research and project evidence', 'References S9-S15 and the implementation record')
for ident, title, url, note in references[8:]:
    b.append(('ref', ident, title, url, note))
sub(b, 'Prior research baseline', 'SIH26261_RESEARCH_GAP_AND_IMPLEMENTATION.md also records a baseline handbook copy, additional vendors and a proposed pilot evaluation. The original handbook retrieval and official SIH-page limitations are documented there. This report does not elevate those earlier limitations into verified facts about current deployments.')
b = page('28. Project evidence and handover index', 'Local sources and how to verify the implementation')
table(b, ['Reference', 'Project material', 'Used for'], [
    ['L1', 'pramaanscope/README.md and IMPLEMENTATION_STATUS.md', 'Current delivery, launch instructions, supported inputs and limitations.'],
    ['L2', 'package.json; client/App.tsx, Access.tsx, styles.css and ocr.ts', 'Technology selection, views, account form, UI tokens and OCR behavior.'],
    ['L3', 'server/rules.ts, documents.ts, store.ts, seed.ts and shared/types.ts', 'Exact checks, synthetic data, database records, dependencies, fingerprints and replacement logic.'],
    ['L4', 'server/auth.ts, server/index.ts and PILOT_SETUP.md', 'Authentication, permissions, source fixtures, protected routes and current easy setup rules.'],
    ['L5', 'SIH26261_RESEARCH_GAP_AND_IMPLEMENTATION.md and PRAMAANSCOPE_IMPLEMENTATION_PLAN.md in workspace root', 'Earlier research, CompliScan review, chosen scope and planned pilot.'],
    ['L6', 'tests/, submission/VERIFICATION.md and preceding executed build/test results', '40 API/rule passes, saved broader browser coverage, and latest protected browser pass.'],
    ['L7', 'submission/evaluation-results.json', 'Twelve deterministic synthetic PDF cases and their actual observed results.'],
    ['L8', 'submission/screenshots/, demonstration script, video and presentation materials', 'Actual saved UI images and practical handover assets.']
], [56, 252, 203])
sub(b, 'Read the source in this order', 'Start with README.md, shared/types.ts, server/rules.ts and server/store.ts. Then inspect server/index.ts and auth.ts for access boundaries, followed by the four client views and the tests. This gives the teammate a useful path from the problem model to the running workflow.')
para(b, 'The report summarizes the source reviewed on 27 October 2026. It makes no claim to have re-audited every line of the separate J.U.S.T.I.S. repository. The source Markdown companion is editable, and the report-generation script is included for reproducible updates.')

def p(text, style='BodyReport'):
    return Paragraph(escape(text), styles[style])

story = []
md = ['# PramaanScope - complete team summary', '', 'Prepared 27 October 2026.', '']
for index, pg in enumerate(pages):
    if index: story.append(PageBreak())
    story.append(p(pg['title'], 'HeadingReport'))
    if pg['subtitle']: story.append(p(pg['subtitle'], 'SmallReport')); story.append(Spacer(1, 9))
    md += ['## '+pg['title'], '', pg['subtitle'], '']
    for block in pg['blocks']:
        kind = block[0]
        if kind == 'p': story.append(p(block[1])); md += [block[1], '']
        elif kind == 'h': story.append(p(block[1], 'SubReport')); md += ['### '+block[1], '']
        elif kind == 'bullet': story.append(p('- '+block[1])); md += ['- '+block[1], '']
        elif kind == 'call':
            t=Table([[p(block[1], 'CalloutReport')]], colWidths=[511])
            t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),PALE),('BOX',(0,0),(-1,-1),0.5,LINE),('LEFTPADDING',(0,0),(-1,-1),14),('RIGHTPADDING',(0,0),(-1,-1),14),('TOPPADDING',(0,0),(-1,-1),12),('BOTTOMPADDING',(0,0),(-1,-1),12)]))
            story += [t, Spacer(1,13)]; md += ['> '+block[1], '']
        elif kind == 'table':
            _, heads, rows, widths = block
            data = [[p(x, 'CellHeadReport') for x in heads]] + [[p(str(x), 'CellReport') for x in row] for row in rows]
            t=Table(data, colWidths=widths or [511/len(heads)]*len(heads), repeatRows=1, hAlign='LEFT')
            t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),NAVY),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),9),('RIGHTPADDING',(0,0),(-1,-1),9),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8),('LINEBELOW',(0,0),(-1,0),0.5,NAVY),('LINEBELOW',(0,1),(-1,-1),0.4,LINE),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#f6f8fb')])]))
            story += [t, Spacer(1,12)]
            md += ['| '+' | '.join(heads)+' |', '| '+' | '.join(['---']*len(heads))+' |']
            md += ['| '+' | '.join(str(x).replace('|','/') for x in row)+' |' for row in rows]; md += ['']
        elif kind == 'image':
            path=ROOT/'submission'/'screenshots'/block[1]
            im=Image(str(path)); scale=min(511/im.imageWidth, 300/im.imageHeight)
            im.drawWidth=im.imageWidth*scale; im.drawHeight=im.imageHeight*scale
            story += [im, Spacer(1,6), p(block[2], 'SmallReport'), Spacer(1,6)]
            md += [f'![{block[2]}](../../submission/screenshots/{block[1]})', '']
        elif kind == 'ref':
            _, ident,title,url,note=block
            text=f'<b>[{ident}] {escape(title)}</b><br/>{escape(note)}<br/><link href="{escape(url, quote=True)}" color="#0f766e">Open source</link>'
            story += [Paragraph(text,styles['SmallReport']),Spacer(1,8)]
            md += [f'[{ident}] [{title}]({url}) - {note}', '']

class PageCanvas(canvas.Canvas):
    def __init__(self,*args,**kwargs): super().__init__(*args,**kwargs); self.saved=[]
    def showPage(self): self.saved.append(dict(self.__dict__)); self._startPage()
    def save(self):
        total=len(self.saved)
        for state in self.saved:
            self.__dict__.update(state)
            self.setFillColor(MUTED); self.setFont('Arial',8)
            self.drawString(42, 22, 'PramaanScope | Team handover | 27 October 2026')
            self.drawRightString(553, 22, f'{self._pageNumber} / {total}')
            self.setStrokeColor(LINE); self.line(42,37,553,37)
            self.setFont('Arial-Bold',8); self.setFillColor(TEAL)
            self.drawString(42,816,'PRAMAANSCOPE / SIH26261')
            self.setFillColor(MUTED); self.setFont('Arial',8)
            self.drawRightString(553,816,'LOCAL PROTOTYPE - SYNTHETIC RECORDS')
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

doc=SimpleDocTemplate(str(PDF), pagesize=(595.28,841.89), rightMargin=36,leftMargin=36,topMargin=53,bottomMargin=51,title='PramaanScope - Complete Team Summary',author='PramaanScope Team',subject='SIH26261 problem, research, implementation and handover')
doc.build(story, canvasmaker=PageCanvas)
MD.write_text('\n'.join(md),encoding='utf-8')
reader=PdfReader(str(PDF))
page_text=[pg.extract_text() or '' for pg in reader.pages]
print(json.dumps({'pdf':str(PDF),'markdown':str(MD),'expectedPages':len(pages),'actualPages':len(reader.pages),'words':sum(len(t.split()) for t in page_text),'pageCharacters':[len(t) for t in page_text]},indent=2))
if len(reader.pages)!=len(pages):
    raise RuntimeError('Unexpected page overflow; inspect and repair before delivery.')
