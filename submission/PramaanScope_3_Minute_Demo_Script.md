# PramaanScope - Prototype Demonstration Video Script

**Team:** CELESTIAL_OUTLAWS  
**Presenter:** Akshaj Sherekar  
**Problem statement:** SIH26261  
**Target length:** Approximately 2 minutes 55 seconds, with a 5-second buffer  
**Delivery:** Clear, confident English with a natural pace of approximately 135-145 words per minute

Read only the quoted narration. Screen actions and captions are recording instructions, not spoken lines. Record short clips and assemble them under the voiceover so typing, uploads and OCR processing do not interrupt the explanation.

## Scene 1 - The problem and our application

**Time: 0:00-0:20**  
**Screen: Application overview, followed by a close-up of the campus discrepancy**

> A certificate can have valid dates and still cover the wrong campus. When that document changes, what happens to the earlier review? I’m Akshaj Sherekar from CELESTIAL_OUTLAWS. Our application, PramaanScope, helps reviewers check institutional evidence and understand the impact of corrections.

**Show:**

- A brief title overlay: **PramaanScope | SIH26261**.
- The Campus A application and the certificate campus discrepancy.
- Keep the prototype's synthetic-data label visible.

**Caption:** The right document must support the right requirement

## Scene 2 - Explain the review problem and dashboard

**Time: 0:20-0:38**  
**Screen: Overview and requirement-evidence matrix**

> Reviewers must check completeness, institution identity, campus, academic periods and previously approved intake. PramaanScope organizes these into twelve findings across six check groups. Each finding explains the result, supporting evidence and next action. Content checks, source verification and human review remain separate.

**Show:**

- Move slowly across the matrix's requirement, evidence result and review columns.
- Point to one item needing attention and one unresolved item.
- Do not describe a content pass as complete regulatory compliance.

**Caption:** 12 findings across 6 check groups

## Scene 3 - Demonstrate document intake and extraction

**Time: 0:38-0:58**  
**Screen: Documents, extracted fields and a short local-OCR clip**

> The MVP accepts PDFs and images, preserves original files and extracts supported information with page references. Here, the original document sits beside its extracted fields. For scanned images, local OCR reads text on the device. Retained versions and file fingerprints help track the submitted evidence.

**Show:**

- **Documents**, then the certificate's **Original document** and **Extracted fields** tabs.
- A short **Upload evidence** or **Add or replace evidence** view to establish intake functionality.
- Cut to **Try a real local OCR sample**, then its actual extracted text.
- Capture the OCR process beforehand and trim the waiting period. Do not substitute invented output.

**Caption:** Original evidence, extracted fields and page references

## Scene 4 - Show the discrepancy and precise clarification

**Time: 0:58-1:20**  
**Screen: Evidence review, certificate original and review form**

> This application concerns Campus A, but its certificate names Campus B. The system identifies unsuitable evidence without calling it forgery. The reviewer records a note and requests evidence for the correct campus. This gives the institution a precise correction to address, rather than a vague resubmission request.

**Show:**

1. Choose **Inspect discrepancy** from Overview.
2. Point to **Campus B** in the original page and the finding explanation.
3. Enter the review note below and choose **Mark reviewed**.
4. Replace the note with the clarification below and choose **Request clarification**.

**Review note to prepare:**

```text
Reviewed the original certificate. It identifies Campus B, while this application concerns Campus A.
```

**Clarification to prepare:**

```text
Provide evidence covering Campus A. The submitted certificate identifies Campus B.
```

**Caption:** A specific discrepancy leads to a specific request

## Scene 5 - Submit a proposed correction

**Time: 1:20-1:32**  
**Screen: Change impact and candidate replacement**

> The institution now proposes a replacement. It remains a candidate until the reviewer accepts it. PramaanScope preserves the active document while extracting and comparing the proposed correction.

**Show:**

- Choose **Open correction workspace**.
- For a repeatable demo, choose **Use corrected sample**. Alternatively, record a permitted **Upload replacement** with a reason.
- Show the current document and proposed replacement together.

**Caption:** Proposed evidence stays separate until acceptance

## Scene 6 - Highlight the flagship USP

**Time: 1:32-1:57**  
**Screen: Calculated impact summary and changed fields**

> This is our key feature: correction impact preview. Before acceptance, the application calculates which findings depend on the old document and which earlier review actions need reconsideration. It also shows findings with unchanged dependencies. The counts come from recorded evidence relationships, helping the reviewer see the consequences before changing the application.

**Show:**

- Pause on **Calculated impact**.
- Show the change from **Campus B** to **Campus A**.
- Point to **affected findings**, **prior review actions** and **unchanged findings**.
- Scroll just enough to reveal the affected-finding comparison.

**Caption:** Calculated correction impact before acceptance

**Presenter note:** In the seeded certificate scenario, five findings depend on the certificate and seven have unchanged dependencies. The number of affected earlier review actions depends on what you recorded. Read the actual displayed counts if you choose to mention them; they are not fixed for every session.

## Scene 7 - Accept and demonstrate review validity

**Time: 1:57-2:15**  
**Screen: Accept & recalculate, followed by Evidence review history**

> After acceptance, the system recalculates the checks and retains the original evidence. Earlier reviews remain linked to the earlier version instead of silently applying to the replacement. If the application changes after a preview, the system requires a refreshed preview before confirmation.

**Show:**

- Choose **Accept & recalculate** as the reviewer.
- Return to the campus finding in **Evidence review**.
- Show the current content result and the **Earlier evidence** label in review history.
- Keep the original version visible in history for a moment.

**Caption:** New evidence receives a current review

**Presenter note:** The refreshed-preview safeguard is implemented, but you do not need to trigger an extra conflict during this short recording. Show the successful main journey and explain the safeguard in the voiceover.

## Scene 8 - Explain uncertainty and source verification

**Time: 2:15-2:28**  
**Screen: Issuing-source verification finding**

> Source verification stays explicit. An unavailable source produces an unresolved task, not automatic rejection. This prototype uses synthetic records and simulated issuer responses. Live government verification and digital-signature validation remain future integration work.

**Show:**

- Select the issuing-source verification finding.
- In the reviewer view, change **Issuer-response simulation** to **Simulated response: unavailable**.
- Pause on the unresolved status and the simulation label.

**Caption:** Unavailable source means unresolved verification

## Scene 9 - Cover supporting MVP functionality

**Time: 2:28-2:43**  
**Screen: Short clips of manual assessment, protected roles and PDF report**

> The MVP also supports manual infrastructure assessment, inspection recommendations, review history and PDF reports. A separate protected mode provides reviewer and institution accounts, with application permissions and private reviewer notes. These features keep evidence handling and responsibility clear.

**Show:**

- A brief view of **Infrastructure evidence assessment** and **Recommend physical inspection**.
- A short clip from the actual protected workspace showing **Accounts** or the institution's restricted view.
- Choose **Export report** and show the generated PDF.

**Caption:** Controlled access, manual assessment and review reports

**Recording note:** Port 47261 is the demonstration workspace. Its persona selector is not authentication. If you show account permissions, capture that short clip from the real protected workspace at port 47263. An already signed-in session is sufficient; account setup does not need to consume video time.

## Scene 10 - Close with the product's value

**Time: 2:43-2:55**  
**Screen: Return to the application overview, then end title**

> PramaanScope connects evidence, clarification and correction impact in one review journey. Our goal is clearer scrutiny and fewer unnecessary repeat checks, while authorized officials retain the final decision. Thank you.

**End title:**

```text
PramaanScope
Evidence review with correction impact tracking
CELESTIAL_OUTLAWS
SIH26261
```

---

## Recording preparation

1. Use a disposable synthetic demonstration session with the original Campus B certificate active. Export any review you want to keep before choosing the demo's reset action.
2. Prepare the two note texts in Scene 4 so the recording does not pause for typing.
3. Record the original **Mark reviewed** action before requesting clarification. This gives the impact preview an earlier review to identify.
4. Record the correction journey in order. A replacement needs an open clarification.
5. Capture OCR, infrastructure assessment, protected-role and report clips separately, then place them at the matching narration points.
6. Keep cursor movement deliberate. Pause on the wrong campus, calculated impact and historical-review label.
7. Read the narration once at a natural pace. The scene timings are edit targets; adjust clip lengths after recording the voiceover.
8. Keep title and closing overlays within the three-minute total. Check the portal if it specifies a different duration.

## Feature and USP coverage

| What the video explains | Where it appears |
| --- | --- |
| What PramaanScope is and which problem it addresses | Scenes 1-2 |
| Completeness, identity, campus, period and historical-intake checks | Scene 2 |
| Evidence matrix, reasons and next actions | Scene 2 |
| Uploads, originals, extraction, page references and local image OCR | Scene 3 |
| Document versions and original-file fingerprints | Scene 3 |
| Evidence-linked review notes and precise clarification | Scene 4 |
| Candidate replacement and controlled acceptance | Scene 5 |
| USP: calculated correction impact | Scene 6 |
| USP: earlier reviews remain tied to earlier evidence | Scene 7 |
| Outdated-preview safeguard | Scene 7 |
| USP: content, source verification and human review remain distinct | Scenes 2 and 8 |
| Source outage and honest simulation boundaries | Scene 8 |
| Manual infrastructure assessment and inspection recommendation | Scene 9 |
| Protected accounts, application permissions and note privacy | Scene 9 |
| Retained history and PDF export | Scenes 7 and 9 |
| Intended benefits and human decision-making | Scene 10 |

The script covers every major functional area in the MVP. A three-minute video cannot explain every field, validation rule or account setting individually; the complete correction journey supplies the main proof, with supporting functionality shown in short clips.

## Optional proof caption

If space permits, display this briefly during Scene 9 without adding it to the narration:

> Recorded verification: 40 API/rule tests passed. Twelve prepared synthetic PDF cases matched expected results.

This describes the saved prototype checks. It is not a claim of real-world accuracy, measured officer time savings or comparative superiority.

## If the recording runs long

- Keep the full clarification, correction preview and historical-review sequence.
- Shorten the OCR and secondary-feature clips first.
- Omit the final sentence of Scene 7 about the outdated-preview safeguard to save approximately five seconds.
- Keep the synthetic-data and simulated-source disclosure.
- Do not speed up the voiceover until it becomes difficult to follow.

## Claim boundaries for the presenter

- Say “scope discrepancy,” not “forged certificate,” for the Campus A / Campus B example.
- Say “original-file fingerprint,” not “proof of authenticity.”
- Describe reduced repeat checks as a goal; no officer pilot has measured the savings.
- Describe the USP as the implemented institutional review workflow, not a worldwide-first invention.
- Infrastructure assessment supports human review; it does not certify physical compliance from a photograph.
- Completing a review does not grant regulatory approval.
