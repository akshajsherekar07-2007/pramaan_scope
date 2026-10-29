import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const headers = { 'X-PramaanScope': 'local-demo' };
test.beforeEach(async ({ request }) => {
  const response = await request.post('/api/demo/reset', { headers, data: { confirmation: 'RESET SYNTHETIC DEMO' } });
  expect(response.ok()).toBeTruthy();
});
test('overview and all main views render without page overflow at four target widths', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/'); await expect(page.getByRole('heading', { name: 'Pragati Institute of Technology' })).toBeVisible();
  await mkdir('submission/screenshots', { recursive: true });
  for (const width of [1440, 1280, 1024, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(page.getByRole('heading', { name: 'Requirements & findings' })).toBeVisible();
    await page.screenshot({ path: `submission/screenshots/overview-${width}.png`, fullPage: true });
    const layout = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth, overflowing: [...document.querySelectorAll('body *')].filter(element => element.getBoundingClientRect().right > innerWidth + 2 && getComputedStyle(element).position !== 'fixed').map(element => ({ tag: element.tagName, class: element.className, right: element.getBoundingClientRect().right })).slice(0, 12) }));
    expect(layout.scroll <= width + 1, JSON.stringify(layout)).toBeTruthy();
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole('button', { name: 'Documents', exact: false }).first().click();
  await expect(page.getByRole('heading', { name: 'Evidence library' })).toBeVisible();
  await page.screenshot({ path: 'submission/screenshots/documents.png', fullPage: true });
  await page.getByRole('button', { name: 'Evidence review', exact: false }).first().click();
  await expect(page.getByRole('heading', { name: 'Supporting evidence' })).toBeVisible();
  await page.screenshot({ path: 'submission/screenshots/review.png', fullPage: true });
  for (const title of ['Documents', 'Evidence review', 'Change impact']) {
    await page.setViewportSize({ width: 390, height: 1000 });
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('button', { name: title, exact: false }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), title).toBeTruthy();
  }
  expect(errors).toEqual([]);
});
test('review, clarification, impact preview, confirmation, and historical review all work', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Inspect discrepancy', exact: true }).click();
  const note = page.getByLabel(/Review note/);
  await note.fill('I inspected the certificate. It covers Campus B rather than Campus A.');
  await page.getByRole('button', { name: 'Mark reviewed', exact: true }).click();
  await expect(page.getByText('Review action saved against this evidence version.')).toBeVisible();
  await note.fill('Provide evidence covering Campus A; this certificate identifies Campus B.');
  await page.getByRole('button', { name: 'Request clarification', exact: true }).click();
  await expect(page.getByText('Clarification is open', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Open correction workspace', exact: false }).click();
  await page.getByRole('button', { name: 'Use corrected sample', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Findings requiring reconsideration' })).toBeVisible();
  await expect(page.locator('.pdf-loading')).toHaveCount(0);
  expect(await page.locator('.rendered-pdf-page img').evaluateAll(images => images.every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBeTruthy();
  await expect(page.getByText('CAMPUS B', { exact: true })).toBeVisible();
  await expect(page.getByText('CAMPUS A', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'submission/screenshots/impact.png', fullPage: true });
  await page.getByRole('button', { name: 'Accept & recalculate', exact: true }).click();
  await expect(page.getByText('Replacement accepted. Affected findings recalculated; earlier reviews retained.')).toBeVisible();
  await page.getByRole('button', { name: 'Evidence review', exact: false }).first().click();
  await expect(page.getByText('Earlier evidence', { exact: true }).first()).toBeVisible();
  await expect(page.locator('.finding-detail .panel-heading').getByText('Consistent', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'submission/screenshots/review-after-correction.png', fullPage: true });
});
test('actual local OCR reads the scan without contacting external services', async ({ page }) => {
  const external: string[] = [];
  page.on('request', request => { if (/^https?:/.test(request.url()) && !request.url().startsWith(process.env.PRAMAAN_BASE_URL || 'http://127.0.0.1:47261')) external.push(request.url()); });
  await page.goto('/'); await page.getByRole('button', { name: 'Documents', exact: false }).first().click();
  await page.getByRole('button', { name: 'Preview OCR sample', exact: false }).click();
  await page.getByRole('button', { name: 'Run local OCR', exact: true }).click();
  await expect(page.locator('.ocr-demo pre')).toContainText('PIT-042', { timeout: 60000 });
  await expect(page.locator('.ocr-demo pre')).toContainText('CAMPUS A');
  expect(external).toEqual([]);
  await page.screenshot({ path: 'submission/screenshots/local-ocr.png', fullPage: true });
});
test('source outage stays unresolved and persona controls prevent reviewer actions', async ({ page }) => {
  await page.goto('/'); await page.getByRole('button', { name: 'Evidence review', exact: false }).first().click();
  await page.getByLabel('Select a finding').selectOption('source-verification');
  await page.getByLabel('Issuer-response simulation').selectOption('UNAVAILABLE');
  await expect(page.getByText('The simulated source is unavailable. This is not evidence of non-compliance.')).toBeVisible();
  await expect(page.locator('.finding-detail .panel-heading').getByText('Unresolved', { exact: true })).toBeVisible();
  await page.getByLabel('Demonstration persona').selectOption('INSTITUTION');
  await expect(page.getByRole('button', { name: 'Mark reviewed', exact: true })).toBeDisabled();
});
