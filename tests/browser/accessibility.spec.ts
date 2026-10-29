import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('main workspace has no serious accessibility violations', async ({ page }) => {
  await page.goto('/'); await expect(page.getByRole('heading', { name: 'Pragati Institute of Technology' })).toBeVisible();
  for (const view of ['Overview', 'Documents', 'Evidence review', 'Change impact']) {
    await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('button', { name: view, exact: false }).click();
    // PDF document accessibility is separate from the web application's interface.
    const results = await new AxeBuilder({ page }).exclude('iframe').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(results.violations.map(item => ({ view, id: item.id, impact: item.impact, nodes: item.nodes.map(node => ({ target: node.target, summary: node.failureSummary })).slice(0, 15) }))).toEqual([]);
  }
});
