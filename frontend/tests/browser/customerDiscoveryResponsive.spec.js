import { test, expect } from '@playwright/test';
const API = 'http://127.0.0.1:5107';
const WEB = 'http://127.0.0.1:5177';
for (const width of [390, 768, 1440]) {
  test(`customer discovery adapts at ${width}px`, async ({ browser, request }, testInfo) => {
    const response = await request.get(`${API}/__browser/fixtures`);
    expect(response.ok()).toBeTruthy();
    const { accounts, city, catalog } = (await response.json()).checkout;
    const context = await browser.newContext({ baseURL: WEB, viewport: { width, height: 900 }, serviceWorkers: 'block' });
    try {
      await context.route('**/*', route => [WEB, API].includes(new URL(route.request().url()).origin) ? route.continue() : route.abort());
      const page = await context.newPage();
      await page.goto('/login');
      await page.locator('input[name="phone"]').fill(accounts.customer.phone);
      await page.locator('input[name="password"]').fill(accounts.customer.password);
      await page.getByRole('button', { name: 'Login', exact: true }).click();
      await expect(page).toHaveURL(/\/home$/);
      await page.getByRole('button', { name: 'Change delivery city' }).click();
      await page.getByRole('dialog', { name: 'Choose your city' }).getByRole('button', { name: city.name }).click();
      const card = page.getByRole('article').filter({ hasText: catalog.brandName });
      await expect(card).toBeVisible();
      const main = page.locator('main').first();
      const bounds = await main.boundingBox();
      expect(bounds.width).toBeGreaterThanOrEqual(Math.min(width, 1280) - 20);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 2);
      await page.screenshot({ path: testInfo.outputPath('customer-discovery.png'), fullPage: true, animations: 'disabled' });
      await card.getByRole('button', { name: /Open now/ }).click();
      await expect(page).toHaveURL(new RegExp(`/vendor/${catalog.branchId}(?:\\?|$)`));
      await expect(page.getByRole('button', { name: `Add ${catalog.itemName} to cart`, exact: true })).toBeVisible();
    } finally { await context.close(); }
  });
}
