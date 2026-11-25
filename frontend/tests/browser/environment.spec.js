import { test, expect } from '@playwright/test';
const API = 'http://127.0.0.1:5107';
test('isolated API readiness and real browser customer login', async ({ page, request }) => {
  const ready = await request.get(`${API}/ready`);
  expect(ready.ok()).toBeTruthy();
  expect(await ready.json()).toMatchObject({ status: 'ready', db: 'up' });
  const fixtureResponse = await request.get(`${API}/__browser/fixtures`);
  expect(fixtureResponse.ok()).toBeTruthy();
  const { accounts } = await fixtureResponse.json();
  // Prevent browser requests to staging or external providers.
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    return ['http://127.0.0.1:5177', API].includes(url.origin) ? route.continue() : route.abort();
  });
  await page.goto('/login');
  await page.locator('input[name="phone"]').fill(accounts.customer.phone);
  await page.locator('input[name="password"]').fill(accounts.customer.password);
  const login = page.waitForResponse(r => r.url() === `${API}/api/auth/login` && r.request().method() === 'POST');
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  expect((await login).status()).toBe(200);
  await expect(page).toHaveURL(/\/home$/);
  const token = await page.evaluate(() => localStorage.getItem('mzaya_token'));
  expect(Boolean(token)).toBe(true);
  const me = await request.get(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
  expect(me.ok()).toBeTruthy();
  expect((await me.json()).user).toMatchObject({ id: accounts.customer.id, role: 'customer' });
});
