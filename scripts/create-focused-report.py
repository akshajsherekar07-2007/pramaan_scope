"""Create a focused, twelve-page problem/research/solution report."""
from pathlib import Path
from html import escape
import json
import re
import subprocess
from PIL import Image as PILImage, ImageDraw
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader
import pdfplumber

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/pdf'
OUT.mkdir(parents=True,exist_ok=True)
PDF=OUT/'PramaanScope-Focused-Research-and-Solution.pdf'
MD=OUT/'PramaanScope-Focused-Research-and-Solution.md'
NAVY=colors.HexColor('#14243b'); TEAL=colors.HexColor('#0f766e')
GRAY=colors.HexColor('#526176'); LINE=colors.HexColor('#dce3ec')
pdfmetrics.registerFont(TTFont('ReportArial','C:/Windows/Fonts/arial.ttf'))
pdfmetrics.registerFont(TTFont('ReportArialBold','C:/Windows/Fonts/arialbd.ttf'))
pdfmetrics.registerFontFamily('ReportArial',normal='ReportArial',bold='ReportArialBold')
styles={
 'title':ParagraphStyle('title',fontName='ReportArialBold',fontSize=23,leading=27,textColor=NAVY,spaceAfter=13),
 'subtitle':ParagraphStyle('subtitle',fontName='ReportArial',fontSize=10,leading=14,textColor=GRAY,spaceAfter=13),
 'body':ParagraphStyle('body',fontName='ReportArial',fontSize=10.2,leading=14.5,textColor=NAVY,spaceAfter=9),
 'h':ParagraphStyle('h',fontName='ReportArialBold',fontSize=12,leading=16,textColor=TEAL,spaceBefore=9,spaceAfter=6),
 'cell':ParagraphStyle('cell',fontName='ReportArial',fontSize=9.3,leading=12.6,textColor=NAVY),
 'th':ParagraphStyle('th',fontName='ReportArialBold',fontSize=9.3,leading=12.6,textColor=colors.white),
 'call':ParagraphStyle('call',fontName='ReportArialBold',fontSize=11,leading=15.5,textColor=TEAL),
 'ref':ParagraphStyle('ref',fontName='ReportArial',fontSize=9,leading=12.5,textColor=GRAY,spaceAfter=11)
}
pages=[]
def page(title,subtitle):
 b=[]; pages.append((title,subtitle,b)); return b
def p(b,t): b.append(('p',t))
def h(b,t,body): b.extend([('h',t),('p',body)])
def call(b,t): b.append(('call',t))
def table(b,heads,rows,widths): b.append(('table',heads,rows,widths))

b=page('1. The problem we are solving','PramaanScope | SIH26261 | Research and solution report')
call(b,'Help a reviewer understand whether the submitted evidence supports the right requirement, for the right institution, campus and period - and what changes after a correction.')
h(b,'The problem statement','SIH26261 is titled "AI-Powered Application Validation, Document Authentication and Regulatory Compliance Verification." AICTE is the organization named in the statement. The reproduced detailed brief calls for preliminary validation of application information, supporting documents, anomalies and authorized-source verification, while officials retain scrutiny and final decisions. [1]')
p(b,'In simple words, a college submits an approval application and supporting documents. A reviewer needs clear answers: Is the required evidence present? Do its details agree with the application? Does it cover the correct campus and time? Which claims have independent confirmation? What should the institution clarify?')
h(b,'Why this problem matters','The reproduced brief describes missing or expired documents, inconsistent details and difficulty confirming records with original sources as sources of delay and administrative effort. There is already an AICTE approval process; the Ministry of Education documents the release of its 2024-2027 Approval Process Handbook. [1, 2]')
table(b,['User','What they need from our application'],[
 ['Reviewer','A clear finding, the evidence behind it, its verification status and a useful next action.'],
 ['Institution coordinator','An exact clarification request and a controlled way to propose corrected evidence.'],
 ['Review supervisor','A preserved explanation of what was checked, which version was reviewed and why a review needs attention again.']
],[132,379])
h(b,'A concrete example from our application','The synthetic application is for Campus A, but the submitted safety certificate names Campus B. Its institution identifier and dates can agree with the application while its campus scope is still unsuitable. PramaanScope exposes that distinction and guides the correction.')
p(b,'Our implemented scope is a local evidence review prototype using synthetic records and a demonstration checklist. The complete official brief and applicable regulatory details still need domain confirmation before institutional use.')

b=page('2. How we researched the solution','What we examined, what we learned and how it shaped the application')
p(b,'We used desk research to test whether the apparent opportunity was already covered by existing products. We reviewed publisher documentation, government information and relevant standards, then compared those findings with the workflow implemented in PramaanScope. We did not conduct officer interviews or paid product trials.')
table(b,['Research area','What we examined','Decision it led to'],[
 ['Approval context','Problem-title evidence, detailed brief reproduction and AICTE handbook release. [1, 2]','Keep findings advisory and retain human decision-making.'],
 ['Document processing','Google Document AI and Instabase. [3, 4]','Treat extraction and cross-document comparison as established components.'],
 ['Evidence review','Diligent Evidence Hub and Vanta Audit. [5, 6]','Do more than collect files or display a review queue.'],
 ['Changes and traceability','Kloom, CUBE and W3C PROV. [7, 8, 9]','Make the evidence basis and consequences of corrections explicit, while acknowledging prior art.'],
 ['Government verification','Entity Locker, NAD and signature-verification guidance. [10, 11, 12]','Separate real confirmation from simulated comparisons and unsupported checks.'],
 ['Fraud and education tools','Ocrolus Detect and Creatrix Campus. [13, 14]','Focus on institutional applicability rather than claim a new universal fraud detector.']
],[110,197,204])
h(b,'What kind of evidence this research gives us','Product documentation establishes that a vendor advertises or documents a capability. It does not independently establish its accuracy, deployment coverage, price or performance on our task. A government announcement establishes that a service exists, not that our project has access to it.')
h(b,'What the research has not established','We have not established that AICTE lacks equivalent internal features, that no enterprise product can be configured similarly, or that this approach is a worldwide first. We also have not measured how frequently wrong-campus documents or stale reviews occur in actual approval processing.')
call(b,'The research helped us select a focused, testable workflow. It supports our design direction; it does not prove that every competitor lacks it.')

b=page('3. What the market already provides','Existing solutions and why the individual features are not enough to differentiate us')
p(b,'The market has strong tools for reading documents, collecting evidence, finding inconsistencies and managing reviews. Our research therefore ruled out broad claims such as "first AI document checker" or "first evidence dashboard."')
table(b,['Existing capability','Examples and documented behavior','Meaning for our solution'],[
 ['Read and structure documents','Google Document AI extracts information, classifies and splits document packets. [3]','OCR and extraction are necessary, but not our central difference.'],
 ['Compare documents','Instabase validates relationships across documents and supports custom functions and external checks. [4]','Matching institution fields or dates is an established capability.'],
 ['Request and review evidence','Diligent documents scoped requests, submissions, role-specific review and activity history. Vanta supports evidence collection and auditor collaboration. [5, 6]','Clarification, upload and history alone are common product patterns.'],
 ['Re-evaluate when evidence changes','Kloom advertises evidence-triggered re-evaluation and decisions anchored to evidence graph versions. [7]','The broad idea of change-aware review already exists.'],
 ['Link obligations and evidence','CUBE describes obligations, controls and evidence in a connected compliance platform. [8]','Rule-to-evidence mapping is not an invention by itself.'],
 ['Find suspicious document signals','Ocrolus provides contextual fraud signals and visual indicators through dashboard and API. [13]','Our basic discrepancy checks should not be presented as superior fraud detection.'],
 ['Manage education evidence','Creatrix supports accreditation data collection, criteria mapping and configurable workflows. [14]','Education-specific evidence management already has commercial alternatives.']
],[115,222,174])
h(b,'Government infrastructure is also relevant','Entity Locker provides organizational document services. NAD provides a registered, consent-based process for supported academic awards. These can be complementary sources in an authorized integration; they do not automatically confirm every certificate submitted by an institution. [10, 11]')
p(b,'The opportunity is to combine the right capabilities into a clear scrutiny task. Public websites do not provide a complete feature inventory, so a missing mention is not evidence of a missing capability.')

b=page('4. The specific gap we identified','The connection between document suitability, uncertainty and review after correction')
call(b,'The gap we target: a reviewer needs one understandable chain from requirement -> applicable evidence -> finding -> clarification -> correction -> renewed review.')
h(b,'Gap 1: presence and authenticity do not establish applicability','An uploaded file may be readable, unchanged and even genuinely issued, yet cover the wrong campus or academic period. A document-presence check cannot answer whether that evidence supports this particular requirement. Our current application demonstrates this using a certificate for Campus B in a Campus A application.')
h(b,'Gap 2: a correction can invalidate an earlier review','A replacement affects more than the file list. The original certificate may support institution identity, campus, validity and source-comparison findings. A reviewer needs to see those relationships before accepting the replacement, then distinguish earlier review actions from reviews of the new evidence.')
h(b,'Gap 3: unclear verification can create false confidence','A local match, an issuer response, a human review and an unavailable source mean different things. If they appear as one green score, an officer may infer more assurance than the system actually has. We keep those dimensions separate.')
table(b,['What we know','What is still a hypothesis'],[
 ['The local application implements scope checking, correction preview and review fingerprints.','Whether this combination reduces real officer time or errors.'],
 ['Several vendors already provide related components and broad concepts.','Whether a focused AICTE workflow is easier to adopt than configuring those platforms.'],
 ['Instabase documents a refresh step for a specific validation-change scenario. [4]','Whether that behavior causes a meaningful burden in a target deployment.'],
 ['Source services have authorization and document-coverage boundaries. [10, 11]','Which authorized integrations would be available for an AICTE pilot.']
],[256,255])
p(b,'This is a product and integration opportunity, not proof of a universally unsolved problem. The strongest claim is that PramaanScope makes these relationships visible and executable in the institutional review case we built.')

b=page('5. The solution we have built','One workspace for evidence, clarification and correction impact')
p(b,'PramaanScope is an institutional evidence review workspace. It reads supported application documents, evaluates a small set of explicit checks, links findings to their supporting evidence, and gives the reviewer a controlled correction workflow.')
table(b,['Part of the solution','What happens in the application','How it fills the gap'],[
 ['Requirement-evidence matrix','Each check shows its result, reason, source state and human-review state.','The reviewer sees what supports a requirement and what remains unresolved.'],
 ['Original-page evidence','Extracted fields can be inspected beside the original document pages.','The user can verify the basis of a finding instead of trusting an unexplained result.'],
 ['Specific clarification','The reviewer records an evidence-linked request, such as asking for the correct campus.','The institution receives an actionable request.'],
 ['Candidate replacement','A proposed correction remains separate from active evidence.','Uploading a file does not silently change the reviewed packet.'],
 ['Correction impact preview','The system compares old/new facts and identifies affected findings and earlier review actions.','The consequences are visible before acceptance.'],
 ['Review validity tracking','A review is tied to the fingerprint of the finding actually reviewed.','Earlier reviews remain historical when their evidence basis changes.'],
 ['Report and history','Versions, findings, notes and events are retained for the reviewer.','The basis of the review remains explainable.']
],[135,200,176])
h(b,'Three answers stay separate','First: does the content agree with the demonstration rule? Second: has an appropriate source independently confirmed the relevant assertion? Third: has a human reviewed this evidence basis? A content pass cannot answer the other two questions.')
h(b,'The role of AI in the current build','Tesseract performs local image OCR. Native PDF extraction and labeled-field parsing provide structured facts. TypeScript rules perform the current comparisons. No cloud LLM, general trained institutional-document classifier or automated statutory decision engine is connected.')
p(b,'The product value is the complete review journey and its evidence handling. Its distinction is not a secret AI prompt that another team could never obtain.')

b=page('6. Our approach, step by step','How information moves through the working application')
table(b,['Stage','What the application does','What the reviewer gains'],[
 ['1. Intake','Accept supported PDF, PNG or JPEG evidence; retain original bytes and a generated version identifier.','A stable record of what was submitted.'],
 ['2. Read','Extract native PDF text or run local image OCR; preserve field values and page references.','Inspectable assertions rather than a hidden answer.'],
 ['3. Compare','Run server rules against active documents, the synthetic profile and the relevant period.','Specific findings with reasons and next actions.'],
 ['4. Review','Show evidence and findings together; record a note or request clarification.','A human judgment attached to the evidence basis.'],
 ['5. Propose correction','Require an open clarification for the document slot and a replacement reason.','A controlled rectification path.'],
 ['6. Preview impact','Evaluate the proposed packet and compare its findings with the active one.','A view of changed fields, dependent findings and affected prior reviews.'],
 ['7. Accept','Check the application revision, activate the candidate and retain the old version in a transaction.','Protection against accepting an outdated preview.'],
 ['8. Reassess','Recalculate checks, distinguish historical reviews and preserve unresolved source verification.','A current review with an understandable history.']
],[93,236,182])
h(b,'How we handle uncertainty','Missing identifiers, conflicting assertions and ambiguous dates remain unresolved. Source unavailability creates a retry or manual-confirmation need; it does not by itself establish non-compliance. A historical approval is assessed against its historical period rather than treated as an expired current certificate.')
h(b,'How the human remains in control','An institution can submit a permitted candidate, but the reviewer accepts it. Reviewer actions and notes remain recorded. Completing the review session does not approve an institution or remove unresolved verification from the report.')
p(b,'The workflow is deterministic where it changes application state. OCR may help read a document, but it does not decide permissions, activate a replacement or grant regulatory approval.')

b=page('7. Our strongest differentiating feature','Correction impact preview with review validity tracking')
p(b,'The strongest feature is what happens between receiving a correction and accepting it. The application shows the consequences first, using relationships registered in the actual findings.')
h(b,'What the preview calculates','It compares the extracted fields in the original and candidate. It identifies current findings that depend on the original document version, calculates the corresponding results for the proposed packet, and counts earlier review actions tied to the affected findings. It also identifies findings whose registered dependencies are unchanged.')
table(b,['Mechanism','Simple explanation','Why it matters'],[
 ['Document-version dependency','A finding records which evidence version it relies on.','The affected set comes from data, not a fixed message.'],
 ['Finding fingerprint','A digital identifier describes the finding and its evidence basis.','A review of old evidence cannot silently become a review of new evidence.'],
 ['Application revision','The preview records the current state number.','Confirmation is rejected if the application changed afterward.'],
 ['Atomic replacement','Old/new version states and related workflow updates are committed together.','The active packet changes consistently.'],
 ['Preserved history','The old document, review actions and replacement event remain available.','The reviewer can explain what was checked earlier.']
],[127,199,185])
h(b,'A concrete calculated result','For the seeded certificate, five findings depend on that document and seven do not. An earlier recorded review can therefore appear in the impact preview. The numbers depend on the active rule set and review history; the application calculates them.')
h(b,'The exact implementation boundary','Dependencies are conservative at document level. A replacement with unchanged text still creates a new document identity. The current evaluator reruns all twelve checks; dependencies determine the displayed impact and review validity. We have not implemented a scheduler that executes only affected rule functions.')
call(b,'Our difference is this working institutional correction journey. Change-triggered re-evaluation itself already has commercial prior art, including Kloom. [7]')

b=page('8. The features that support the solution','What is present in the current application')
table(b,['Feature group','Delivered behavior'],[
 ['Evidence intake and versions','PDF/PNG/JPEG upload, 10 MB limit, file-type checks, original preservation, duplicate-byte warning and candidate/active/superseded versions.'],
 ['Extraction and evidence display','Native PDF text, rendered original pages, field/page references and local English image OCR using bundled assets.'],
 ['Evidence readiness','Required-document and infrastructure-readiness findings.'],
 ['Identity checks','Institution identifier comparisons in the application, previous approval, certificate and undertaking.'],
 ['Campus applicability','Certificate campus against the selected application campus.'],
 ['Period and validity','Application year, previous approval period and explicit certificate validity dates.'],
 ['Historical intake','Previously approved course and numeric intake compared across the application and approval evidence.'],
 ['Source comparison','Clearly simulated match, mismatch and unavailable outcomes; source-attempt history and coverage statement.'],
 ['Review and rectification','Notes, specific clarification, permitted candidate submission, impact preview, acceptance and historical reviews.'],
 ['Institution/reviewer access','Real local accounts, assigned-application checks and private reviewer-note filtering in protected mode.'],
 ['Infrastructure assistance','Supporting image, manual assessment and inspection recommendation.'],
 ['Reporting','Reviewer PDF export, analysis snapshots, retained versions and action history.']
],[137,374])
p(b,'The twelve current findings sit within six groups: evidence readiness, institution identity, campus applicability, period/validity, historical intake and source comparison. Their scope is a demonstration checklist, not a complete official AICTE rule pack.')
p(b,'The four views are Overview, Documents, Review and Changes. They keep the requirement, evidence and next action together, using a consistent institutional visual style and responsive layout.')
p(b,'The current parser targets labeled English fields. Image-only multipage PDFs need page images in this build. Source responses remain simulated, signatures are not cryptographically validated, and infrastructure images do not establish physical compliance.')

b=page('9. Competitors and our relative position','Where we are different, where they are stronger and what remains unproved')
table(b,['Alternative','Their relevant strength','Our focused difference / honest limit'],[
 ['Google Document AI [3]','General document extraction, classification and splitting.','We provide an institutional review journey around evidence and corrections. Their broader extraction coverage is not matched by our prototype.'],
 ['Instabase [4]','Packet-level validation and configurable processing/review logic.','We show a prebuilt campus-scope and replacement-impact case. Instabase could be configured for similar workflows.'],
 ['Diligent / Vanta [5, 6]','Evidence collection, collaboration, review and audit processes.','We connect a proposed replacement to particular findings and earlier reviews in one scrutiny task. Basic collection/review is shared ground.'],
 ['Kloom [7]','Advertised evidence-driven re-evaluation and versioned decision basis.','Our distinction is the institutional application, scope and permitted-correction experience. The broader concept is not unique to us.'],
 ['Creatrix Campus [14]','Education accreditation evidence, criteria and workflow management.','We focus on the suitability of submitted evidence and its correction impact. Broader education management is not our current scope.'],
 ['Ocrolus Detect [13]','Specialized document fraud indicators and visual signals.','We identify selected discrepancies and support review. We do not claim stronger fraud-detection performance.'],
 ['CUBE [8]','Regulatory change, obligations, controls and evidence.','We implement a bounded institutional packet review, not an equivalent regulatory intelligence platform.']
],[100,171,240])
h(b,'In what sense can we say we are better?','For our chosen demonstration, we have an explicit, inspectable path from a wrong-campus document to a precise request, a calculated preview and renewed review. That is a strength of our implementation. It is not evidence of superior accuracy, cost or speed against these vendors.')
p(b,'A direct competitive advantage would require the same representative tasks, comparable configuration effort and measured outcomes. We have not performed that head-to-head study. Our claim today is focused task fit and demonstrated behavior.')

b=page('10. How we implemented it','The technology choices behind the solution')
table(b,['Layer','Current technology','Reason for the choice'],[
 ['Frontend','React, TypeScript and Vite','A responsive workspace with shared typed data models.'],
 ['Design system','CSS tokens, local Inter font and Lucide icons','Consistent spacing, readable states and a professional interface.'],
 ['API','Node.js 24.15+ and Express','Serve the application, enforce permissions and evaluate rules on one local origin.'],
 ['Request handling','Zod and Multer','Validate input and enforce upload limits.'],
 ['Database','SQLite through node:sqlite','Persist the small local application and commit replacements atomically.'],
 ['Evidence files','Private local filesystem; Node crypto SHA-256','Retain original bytes under generated identifiers. A hash identifies bytes; it does not prove authenticity.'],
 ['PDF processing','pdf-parse 2.4.5','Actual native text extraction and original-page rendering.'],
 ['Image OCR','Tesseract.js 5 with local English assets','Read supported scans without a mandatory cloud service.'],
 ['Reporting','jsPDF','Generate the reviewer report.'],
 ['Verification','Node test runner, Playwright and axe','Exercise rule behavior, access checks, browser flows and accessibility scans.']
],[105,181,225])
h(b,'How the pieces connect','The browser calls the Express API. Access checks run before protected actions. Document services extract and render evidence; rules produce findings; SQLite preserves applications, versions, analysis snapshots, reviews, clarification and source attempts. Originals remain separate from metadata.')
h(b,'Useful optimizations already present','OCR loads on demand and reuses its worker. Original-page rendering uses a bounded cache and shares concurrent requests for the same page. Upload limits bound processing work. The local application needs no separate database service or cloud model account.')
p(b,'The current deployment is a local synthetic-data prototype, not a measured high-load service. Its technical value is the working evidence and review model. We have not established national-scale throughput or production uptime.')

b=page('11. What we have proved and what makes us different','A clear statement of the value we can demonstrate today')
p(b,'The local application demonstrates a full journey: evidence inspection, a wrong-campus finding, a specific clarification, a proposed replacement, calculated impact, acceptance, retained historical review and report export. The core feature is implemented as application behavior.')
table(b,['Evidence available','What it supports'],[
 ['Successful TypeScript / Vite build','The current source compiles and builds.'],
 ['40 passing API/rule tests','Selected extraction, clarification, replacement, review, source-outage, reporting, account, session and privacy behavior.'],
 ['Latest protected browser journey passed','Reviewer setup, email usernames, institution access and the correction flow work together in the tested browser environment.'],
 ['Saved six-scenario browser verification','Broader responsive, accessibility, OCR and workflow scenarios were executed.'],
 ['12 synthetic PDF evaluation cases','Prepared expected outcomes matched the observed rule results using actual PDF extraction.']
],[187,324])
h(b,'The difference that is visible in the application','We do not stop at telling the officer that a field matches. We show what evidence supports the check, which verification dimension remains unresolved, what the institution should provide, and which earlier reviews need attention when the evidence changes. These are connected steps in one workflow.')
h(b,'Why another team using AI is not automatically equivalent','Another team can obtain the same feature ideas. What must be compared is the delivered behavior: whether preview counts are calculated, whether old reviews stay tied to old evidence, whether an outdated preview is rejected, and whether a source outage stays unresolved. Our tests and demonstration provide evidence for those behaviors.')
h(b,'What the current evidence does not prove','Synthetic cases do not establish real-world accuracy or officer time savings. We have not measured superiority over competitors or proved that AICTE lacks comparable tools. The strongest future advantage would come from validated rules, authorized sources and representative reviewer results.')
call(b,'Our defensible proposition: PramaanScope connects requirement-specific evidence, precise clarification and correction impact so a reviewer can understand what is supported now and what needs review again.')

b=page('12. Research sources','Public evidence behind the research and competitor comparisons')
p(b,'Sources were reviewed during the project research and checked again on 27 October 2026 for the preceding research report. The numbered links below support the public-capability descriptions in this report. They are not independent vendor benchmarks.')
refs=[
 ('1','SIH26261 detailed brief reproduction','https://zaidsayyed.in/tools/sih-problem-statements/sih26261','Third-party source; the full official brief still needs confirmation.'),
 ('2','Ministry of Education / PIB: AICTE handbook release','https://www.pib.gov.in/PressReleasePage.aspx?PRID=1983013&lang=2&reg=48','Existing approval context and release of the 2024-2027 handbook.'),
 ('3','Google Cloud: Document AI','https://cloud.google.com/document-ai','Extraction, classification, splitting and OCR.'),
 ('4','Instabase: Validating packets','https://docs.instabase.com/automate/validating-packets','Cross-document validation, custom functions and documented refresh behavior.'),
 ('5','Diligent: Responding to and submitting evidence','https://help.diligentoneplatform.com/helpdocs/d1p/en-us/Content/evidence_hub/tasks/respond-to-and-submit-evidence.htm','Scoped evidence requests, submission, review roles and history.'),
 ('6','Vanta: Audit','https://www.vanta.com/products/audit','Evidence collection and auditor collaboration.'),
 ('7','Kloom: Continuous due diligence and KYC','https://kloom.ai/continuous-due-diligence-kyc/','Advertised re-evaluation as evidence arrives and graph-version decision basis.'),
 ('8','CUBE: RegPlatform','https://www.cube.global/products/regplatform','Regulatory obligations, controls and evidence mapping.'),
 ('9','W3C: PROV namespace','https://www.w3.org/ns/prov','Established provenance, derivation and invalidation concepts.'),
 ('10','MeitY / PIB: Entity Locker','https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=2094574&lang=2&reg=3','Organizational document sharing, verification and consent features.'),
 ('11','DigiLocker NAD: Verifier','https://nad.digilocker.gov.in/Verifier','Registration, consent and availability for supported academic awards.'),
 ('12','Controller of Certifying Authorities: Signature verification','https://www.cca.gov.in/index.php/signature_verification.html','Certificate-chain and revocation material for signature verification.'),
 ('13','Ocrolus: Detect documentation','https://docs.ocrolus.com/docs/detect','Document-fraud signals, context and API/dashboard review.'),
 ('14','Creatrix Campus: Accreditation management','https://www.creatrixcampus.com/accreditation-management-software','Publisher-indexed feature descriptions; direct retrieval returned a gateway error.')
]
for ref in refs: b.append(('ref',*ref))
p(b,'Implementation claims were checked against the current application source, implementation status, access documentation, saved verification and twelve-case evaluation results. Those records substantiate local behavior; public sources substantiate the market descriptions.')

def paragraph(t,style='body'): return Paragraph(escape(t),styles[style])
story=[]; md=['# PramaanScope - focused research and solution report','','Prepared 27 October 2026.','']
for i,(title,subtitle,blocks) in enumerate(pages):
 if i: story.append(PageBreak())
 story.extend([paragraph(title,'title'),paragraph(subtitle,'subtitle')]); md.extend(['## '+title,'',subtitle,''])
 for block in blocks:
  kind=block[0]
  if kind=='p': story.append(paragraph(block[1])); md.extend([block[1],''])
  elif kind=='h': story.append(paragraph(block[1],'h')); md.extend(['### '+block[1],''])
  elif kind=='call':
   t=Table([[paragraph(block[1],'call')]],colWidths=[511])
   t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),colors.HexColor('#edf6f4')),('BOX',(0,0),(-1,-1),0.5,LINE),('LEFTPADDING',(0,0),(-1,-1),12),('RIGHTPADDING',(0,0),(-1,-1),12),('TOPPADDING',(0,0),(-1,-1),11),('BOTTOMPADDING',(0,0),(-1,-1),11)]))
   story.extend([t,Spacer(1,11)]); md.extend(['> '+block[1],''])
  elif kind=='table':
   _,heads,rows,widths=block
   data=[[paragraph(t,'th') for t in heads]]+[[paragraph(t,'cell') for t in row] for row in rows]
   t=Table(data,colWidths=widths,repeatRows=1,hAlign='LEFT')
   t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),NAVY),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#f5f7fa')]),('LINEBELOW',(0,1),(-1,-1),0.4,LINE)]))
   story.extend([t,Spacer(1,10)]); md.extend(['| '+' | '.join(heads)+' |','| '+' | '.join(['---']*len(heads))+' |'])
   md.extend(['| '+' | '.join(row)+' |' for row in rows]); md.append('')
  elif kind=='ref':
   _,num,title,url,note=block
   text=f'<b>[{num}] <link href="{escape(url,quote=True)}" color="#0f766e">{escape(title)}</link></b><br/>{escape(note)}'
   story.append(Paragraph(text,styles['ref'])); md.extend([f'[{num}] [{title}]({url}) - {note}',''])

class NumberedCanvas(canvas.Canvas):
 def __init__(self,*a,**kw): super().__init__(*a,**kw); self.states=[]
 def showPage(self): self.states.append(dict(self.__dict__)); self._startPage()
 def save(self):
  total=len(self.states)
  for state in self.states:
   self.__dict__.update(state)
   self.setFont('ReportArialBold',8); self.setFillColor(TEAL); self.drawString(42,816,'PRAMAANSCOPE / RESEARCH AND SOLUTION')
   self.setFont('ReportArial',8); self.setFillColor(GRAY); self.drawRightString(553,816,'SIH26261')
   self.setStrokeColor(LINE); self.line(42,37,553,37)
   self.setFont('ReportArial',8); self.drawString(42,23,'27 October 2026 | Institutional evidence review')
   self.drawRightString(553,23,f'{self._pageNumber} / {total}')
   canvas.Canvas.showPage(self)
  canvas.Canvas.save(self)

doc=SimpleDocTemplate(str(PDF),pagesize=(595.28,841.89),leftMargin=36,rightMargin=36,topMargin=51,bottomMargin=49,title='PramaanScope - Focused Research and Solution',author='PramaanScope Team')
doc.build(story,canvasmaker=NumberedCanvas)
MD.write_text('\n'.join(md),encoding='utf-8')
reader=PdfReader(str(PDF)); text='\n'.join(pg.extract_text() or '' for pg in reader.pages)
for forbidden in ['26262','26264','CompliScan','J.U.S.T.I.S','complaint dashboard']:
 if forbidden.lower() in text.lower(): raise RuntimeError('Out-of-scope reference found: '+forbidden)
if len(reader.pages)!=12: raise RuntimeError(f'Expected 12 clean pages; got {len(reader.pages)}')
qa=ROOT/'tmp/pdfs/focused-report'; qa.mkdir(parents=True,exist_ok=True)
subprocess.run(['pdftoppm','-r','80','-png',str(PDF),str(qa/'page')],check=True)
files=sorted(qa.glob('page-*.png'))
for start in range(0,len(files),4):
 sheet=PILImage.new('RGB',(1080,1540),'#dce3ec'); draw=ImageDraw.Draw(sheet)
 for j,path in enumerate(files[start:start+4]):
  im=PILImage.open(path).convert('RGB'); im.thumbnail((520,735))
  x=10+(j%2)*540; y=25+(j//2)*770
  sheet.paste(im,(x,y)); draw.text((x,y-16),f'PAGE {start+j+1}',fill='#14243b')
 sheet.save(qa/f'contact-{start//4+1}.png')
outside=[]
with pdfplumber.open(PDF) as pdf:
 for i,pg in enumerate(pdf.pages,1):
  if any(c['x0']<35 or c['x1']>560 or c['top']<15 or c['bottom']>827 for c in pg.chars): outside.append(i)
if outside: raise RuntimeError('Text outside page safe bounds: '+str(outside))
print(json.dumps({'pdf':str(PDF),'markdown':str(MD),'pages':len(reader.pages),'words':len(text.split()),'referenceLinks':sum(len(pg.get('/Annots',[])) for pg in reader.pages),'scopeCheck':'passed','pageBoundsCheck':'passed','renderedPages':len(files)},indent=2))
