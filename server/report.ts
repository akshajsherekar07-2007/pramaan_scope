import { jsPDF } from 'jspdf';
import { SLOT_NAMES, type Snapshot } from '../shared/types.js';
export function reportPdf(snapshot: Snapshot): Buffer {
  const pdf = new jsPDF(); let y = 0;
  const clean = (value: string) => value.replace(/[–—]/g, '-').replace(/[^\x20-\x7e\n]/g, '');
  function page() {
    pdf.setFillColor('#14243b'); pdf.rect(0, 0, 210, 30, 'F'); pdf.setTextColor('#ffffff');
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(18); pdf.text('PramaanScope', 16, 17);
    pdf.setFontSize(8); pdf.text('PROTOTYPE REVIEW REPORT / SYNTHETIC DATA', 16, 24); y = 43;
  }
  function text(value: string, size = 10, bold = false) {
    pdf.setFont('helvetica', bold ? 'bold' : 'normal'); pdf.setFontSize(size); pdf.setTextColor('#14243b');
    const lines: string[] = pdf.splitTextToSize(clean(value), 176);
    for (const line of lines) { if (y > 270) { pdf.addPage(); page(); } pdf.text(line, 17, y); y += size * .48; } y += 3;
  }
  page(); const app = snapshot.application;
  text(app.institution, 18, true); text(`${app.id} / ${app.campus} / ${app.period}`);
  text(`Reference date: ${app.referenceDate}. Application revision: ${app.revision}.`);
  text('Demonstration checklist only. This report is not an AICTE approval, official deficiency notice, or independent document-authenticity certificate. All issuer responses are simulated. Signatures have not been cryptographically verified.', 9);
  text('Requirement findings', 14, true);
  for (const finding of snapshot.findings) {
    text(`${finding.title} - ${finding.status}`, 11, true); text(finding.reason, 9);
    for (const evidence of finding.evidence.slice(0, 4)) text(`Evidence: ${evidence.name}, page ${evidence.page}: ${evidence.quote}`, 8);
    const reviews = snapshot.reviews.filter(review => review.findingKey === finding.key);
    const latest = reviews.at(-1);
    text(`Review: ${latest ? latest.fingerprint === finding.fingerprint ? latest.action : 'RE-REVIEW REQUIRED: supporting evidence changed' : 'Not reviewed'}. Source: ${finding.sourceStatus}. Rule: ${finding.ruleVersion}.`, 8);
    text(`Next action: ${finding.nextAction}`, 9);
  }
  text('Document versions and integrity', 14, true);
  for (const doc of snapshot.documents) { text(`${SLOT_NAMES[doc.slot]} v${doc.version} - ${doc.state} - ${doc.name}`, 10, true); text(`SHA-256: ${doc.hash}`, 8); text(`Extraction: ${doc.status}. Fingerprint confirms byte consistency, not authenticity.`, 8); }
  text('Review and correction history', 14, true);
  for (const event of [...snapshot.events].reverse()) text(`${event.createdAt} / ${event.actor} / ${event.type}: ${event.detail}`, 8);
  for (let index = 1; index <= pdf.getNumberOfPages(); index++) { pdf.setPage(index); pdf.setTextColor('#526176'); pdf.setFontSize(8); pdf.text(`PramaanScope / SIH26261 / Page ${index} of ${pdf.getNumberOfPages()}`, 17, 287); }
  return Buffer.from(pdf.output('arraybuffer'));
}
