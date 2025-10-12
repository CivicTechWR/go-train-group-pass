import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('home page has no WCAG 2.0 A/AA violations', async ({ page }) => {
    await page.goto('/');

    // Ensure the primary hero content renders
    await expect(
      page.getByRole('heading', { name: /GO Train Group Pass/i })
    ).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
