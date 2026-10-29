import { jsPDF } from 'jspdf';
import type { Application, Slot } from '../shared/types.js';
import { APP_ID, SLOT_NAMES } from '../shared/types.js';

export const BASE_APPLICATION: Application = {
  id: APP_ID, institution: 'Pragati Institute of Technology', institutionId: 'PIT-042',
  trust: 'Pragati Education Trust', campus: 'CAMPUS A', address: 'Knowledge Park, Pune, Maharashtra',
  period: '2026-27', previousPeriod: '2025-26', referenceDate: '2026-10-27',
  course: 'B.TECH COMPUTER SCIENCE', intake: '60', revision: 1, workflow: 'UNDER_REVIEW', fixtureMode: 'MATCH'
};
export const SAMPLE_TEXT = {
  application: ['Institution Name: Pragati Institute of Technology', 'Institution ID: PIT-042', 'Campus: CAMPUS A', 'Academic Year: 2026-27', 'Course: B.TECH COMPUTER SCIENCE', 'Previously Approved Intake: 60'],
  approval: ['Institution Name: Pragati Institute of Technology', 'Institution ID: PIT-042', 'Campus: CAMPUS A', 'Approval Period: 2025-26', 'Course: B.TECH COMPUTER SCIENCE', 'Approved Intake: 60'],
  certificate: ['Institution Name: Pragati Institute of Technology', 'Institution ID: PIT-042', 'Campus: CAMPUS B', 'Certificate ID: DEMO-SAFE-2026-042', 'Issuer: Synthetic Municipal Safety Office', 'Valid From: 2026-01-01', 'Valid Until: 2027-12-31'],
  undertaking: ['Institution Name: Pragati Institute of Technology', 'Institution ID: PIT-042', 'Campus: CAMPUS A', 'Academic Year: 2026-27', 'Declaration: Submitted information relates to Campus A.']
};
export const CORRECTED_TEXT = SAMPLE_TEXT.certificate.map(line => line === 'Campus: CAMPUS B' ? 'Campus: CAMPUS A' : line);
export function makeSamplePDF(slot: Slot, lines: string[]): Buffer {
  const pdf = new jsPDF();
  pdf.setFillColor('#14243b'); pdf.rect(0, 0, 210, 42, 'F');
  pdf.setTextColor('#ffffff'); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(21); pdf.text('PramaanScope', 20, 22);
  pdf.setFontSize(9); pdf.setFont('helvetica', 'normal'); pdf.text('SYNTHETIC DEMONSTRATION DOCUMENT', 20, 32);
  pdf.setTextColor('#14243b'); pdf.setFontSize(19); pdf.text(SLOT_NAMES[slot], 20, 62);
  pdf.setDrawColor('#dce3ec'); pdf.line(20, 70, 190, 70);
  pdf.setFontSize(11); pdf.setFont('helvetica', 'normal');
  lines.forEach((line, index) => pdf.text(line, 20, 86 + index * 12));
  pdf.setFontSize(9); pdf.setTextColor('#526176');
  pdf.text(pdf.splitTextToSize('For prototype evaluation only. This is not an AICTE approval, a statutory certificate, or independent issuer confirmation.', 170), 20, 244);
  pdf.text('Pragati Institute of Technology is a synthetic example.', 20, 270);
  pdf.text('Page 1 of 1', 166, 280);
  return Buffer.from(pdf.output('arraybuffer'));
}
