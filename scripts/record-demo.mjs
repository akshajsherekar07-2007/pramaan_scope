import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { resolve } from 'node:path';

await mkdir('submission/screenshots', { recursive: true });
const base = process.env.PRAMAAN_BASE_URL || 'http://127.0.0.1:47261';
const reset = () => fetch(base + '/api/demo/reset', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-PramaanScope': 'local-demo' }, body: JSON.stringify({ confirmation: 'RESET SYNTHETIC DEMO' }) });
await reset();
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: 'submission/.capture', size: { width: 1440, height: 900 } }, reducedMotion: 'reduce' });
const page = await context.newPage(); const video = page.video();
const captions = [];
const started = Date.now();
async function caption(title, description) {
  const seconds = Math.round((Date.now() - started) / 1000); captions.push({ seconds, title, description }); console.log(`${seconds}s: ${title}`);
  await page.evaluate(({ title, description }) => {
    let element = document.getElementById('recording-caption');
    if (!element) { element = document.createElement('div'); element.id = 'recording-caption'; element.style.cssText = 'position:fixed;bottom:18px;left:260px;right:24px;z-index:9999;background:rgba(13,29,48,.96);color:white;padding:14px 20px;border-radius:8px;box-shadow:0 3px 20px #14243b33;pointer-events:none;font-family:Inter,Arial,sans-serif'; document.body.append(element); }
    element.replaceChildren(); const heading = document.createElement('strong'); heading.style.cssText = 'display:block;font-size:17px;color:#9ce7d0;margin-bottom:4px'; heading.textContent = title;
    const body = document.createElement('span'); body.style.cssText = 'font-size:14px;line-height:1.5'; body.textContent = description; element.append(heading, body);
  }, { title, description });
}
async function until(seconds) { const delay = started + seconds * 1000 - Date.now(); if (delay > 0) await page.waitForTimeout(delay); }
async function cleanScreenshot(name) {
  const loading = page.locator('.pdf-loading');
  for (let index = 0; index < await loading.count(); index++) await loading.nth(index).waitFor({ state: 'hidden', timeout: 30000 });
  await page.evaluate(() => { const caption = document.getElementById('recording-caption'); if (caption) caption.style.visibility = 'hidden'; });
  await page.screenshot({ path: `submission/screenshots/${name}.png` });
  await page.evaluate(() => { const caption = document.getElementById('recording-caption'); if (caption) caption.style.visibility = 'visible'; });
}
try {
  await page.goto(base); await page.getByRole('heading', { name: 'Requirements & findings' }).waitFor();
  await caption('PramaanScope · SIH26261', 'Evidence-led institutional review. This demonstration uses synthetic records; all issuing-source responses are simulated.');
  await cleanScreenshot('overview-focus'); await until(15);
  await caption('Each requirement has its own evidence and result', 'The matrix separates consistent content, discrepancies, unresolved verification, and human review.');
  await page.getByRole('button', { name: 'Needs attention', exact: true }).click(); await until(28);
  await page.getByRole('button', { name: 'Inspect discrepancy', exact: true }).click();
  await caption('Readable evidence can still cover the wrong campus', 'The application concerns Campus A. The submitted certificate identifies Campus B. The original and extracted passage appear together.');
  await cleanScreenshot('review-focus'); await until(46);
  const note = page.getByLabel(/Review note/);
  await note.fill('Reviewed the original certificate. It identifies Campus B rather than the Campus A in this application.');
  await page.getByRole('button', { name: 'Mark reviewed', exact: true }).click();
  await note.fill('Provide evidence covering Campus A; the submitted certificate identifies Campus B.');
  await page.getByRole('button', { name: 'Request clarification', exact: true }).click();
  await caption('Request the specific evidence needed', 'The reviewer records a precise clarification. The finding and its original evidence remain in the review history.'); await until(63);
  await page.getByRole('button', { name: 'Open correction workspace', exact: false }).click();
  await page.getByRole('button', { name: 'Use corrected sample', exact: true }).click();
  await page.getByRole('heading', { name: 'Findings requiring reconsideration' }).waitFor();
  await page.evaluate(() => scrollTo(0, 260));
  await caption('Preview the impact before accepting a correction', 'The uploaded candidate is actually parsed. The system calculates changed fields, dependent findings, prior review actions, and unaffected findings.');
  await cleanScreenshot('impact-focus'); await until(87);
  await page.getByRole('heading', { name: 'What changes', exact: true }).scrollIntoViewIfNeeded();
  await caption('The campus changes from B to A', 'Document-level dependencies trigger conservative recalculation. Prior source attestations are not transferred to new file bytes.');
  await cleanScreenshot('impact-details-focus'); await until(108);
  await page.getByRole('button', { name: 'Accept & recalculate', exact: true }).click();
  await page.getByText('Replacement accepted. Affected findings recalculated; earlier reviews retained.').waitFor();
  await caption('Accept the replacement and retain the old review', 'The original is superseded, affected checks are recalculated, and earlier reviews remain historical rather than silently becoming current.'); await until(124);
  await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('button', { name: 'Evidence review', exact: false }).click();
  await page.getByText('Earlier evidence', { exact: true }).first().waitFor();
  await page.locator('.review-history').scrollIntoViewIfNeeded();
  await caption('An old green review cannot stand in for new evidence', 'The current campus check is consistent. Earlier review actions explicitly refer to the previous evidence version and need reconsideration.'); await until(143);
  await page.getByLabel('Select a finding').selectOption('source-verification');
  await page.getByLabel('Issuer-response simulation').selectOption('UNAVAILABLE');
  await page.locator('.finding-explanation').scrollIntoViewIfNeeded();
  await caption('A source outage is an unresolved check', 'The simulated source is unavailable. The system requests manual confirmation and does not automatically reject the institution.'); await until(158);
  await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('button', { name: 'Documents', exact: false }).click();
  await page.getByRole('button', { name: 'Preview OCR sample', exact: false }).click();
  await page.getByRole('button', { name: 'Run local OCR', exact: true }).click();
  await page.locator('.ocr-demo pre').filter({ hasText: 'PIT-042' }).waitFor({ timeout: 60000 });
  await caption('Real OCR, processed locally', 'The bundled Tesseract model reads the synthetic scan on this device. No cloud key is required. Extraction does not establish authenticity.');
  await cleanScreenshot('ocr-focus'); await until(174);
  await page.getByRole('button', { name: 'Close dialog', exact: true }).click();
  const pdf = await fetch(base + '/api/applications/PS-2026-0042/report'); await writeFile('submission/PramaanScope_Sample_Review_Report.pdf', new Uint8Array(await pdf.arrayBuffer()));
  await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('button', { name: 'Overview', exact: false }).click();
  await page.evaluate(() => scrollTo(0, 0));
  await caption('Evidence, corrections, and reasons stay together', 'The working prototype exports a review report. Live issuer connections, signature validation, and production authentication remain pilot work.'); await until(181);
  await context.close(); await video.saveAs('submission/PramaanScope_Demo.webm'); await browser.close();
  await writeFile('submission/video-captions.json', JSON.stringify(captions, null, 2));
  const encoder = resolve('.media-tools/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe');
  await promisify(execFile)(encoder, ['-y', '-i', 'submission/PramaanScope_Demo.webm', '-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', 'submission/PramaanScope_Demo.mp4'], { windowsHide: true, maxBuffer: 4 * 1024 * 1024 });
  await reset(); console.log('Walkthrough recorded and MP4 encoded. Synthetic workspace restored.');
} catch (error) { await context.close().catch(() => {}); await browser.close(); throw error; }
