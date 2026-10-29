import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser', timeout: 90000, workers: 1,
  use: { baseURL: process.env.PRAMAAN_BASE_URL || 'http://127.0.0.1:47261', channel: 'chrome', headless: true, viewport: { width: 1440, height: 1000 }, trace: 'retain-on-failure' },
  reporter: [['list'], ['json', { outputFile: 'test-results/browser-results.json' }]],
});
