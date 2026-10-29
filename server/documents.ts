import { PDFParse } from 'pdf-parse';
import { parseFacts } from './rules.js';
import type { Fact, PageText } from '../shared/types.js';

export async function extractPdf(buffer: Buffer): Promise<{ pages: PageText[]; facts: Fact[]; status: 'READY' | 'NEEDS_OCR' }> {
  const parser = new PDFParse({ data: buffer });
  try {
    const info = await parser.getInfo();
    if (info.total > 10) throw new Error('PDFs may contain at most 10 pages. Split this document and retry.');
    const result = await parser.getText();
    const pages = result.pages.map(page => ({ page: page.num, text: page.text }));
    const hasText = pages.some(page => page.text.replace(/\s/g, '').length > 20);
    return { pages, facts: parseFacts(pages, 'PDF_TEXT'), status: hasText ? 'READY' : 'NEEDS_OCR' };
  } finally { await parser.destroy(); }
}
export function detectMime(buffer: Buffer): string | null {
  if (buffer.subarray(0, 5).toString() === '%PDF-') return 'application/pdf';
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'image/png';
  if (buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) return 'image/jpeg';
  return null;
}

export async function renderPdfPage(buffer: Buffer, page: number): Promise<Buffer> {
  const parser = new PDFParse({ data: buffer });
  try {
    const info = await parser.getInfo({ parsePageInfo: true });
    if (page > info.total || info.total > 10) throw new Error('Page is outside the supported document range.');
    const metadata = info.pages.find(item => item.pageNumber === page);
    if (metadata && (metadata.height / metadata.width > 5 || metadata.width / metadata.height > 5)) throw new Error('This unusual page shape must be opened in the original PDF viewer.');
    const result = await parser.getScreenshot({ partial: [page], desiredWidth: 1100, imageDataUrl: false });
    if (!result.pages[0]?.data) throw new Error('The original page could not be rendered.');
    return Buffer.from(result.pages[0].data);
  } finally { await parser.destroy(); }
}
