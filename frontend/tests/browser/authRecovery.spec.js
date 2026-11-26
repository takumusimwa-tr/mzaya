import { test, expect } from '@playwright/test';
const API = 'http://127.0.0.1:5107';
const WEB = 'http://127.0.0.1:5177';

test('expired authentication clears session and permits safe reauthentication', async ({ page, request }) => {
  const fixtures = await request.get(`${API}/__browser/fixtures`);
  expect(fixtures.ok()).toBeTruthy();
  const { authRecovery } = await fixtures.json();
  const account = authRecovery.accounts.customer;
  await page.route('**/*', route => [WEB, API].includes(new URL(route.request().url()).origin) ? route.continue() : route.abort());
  async function login() {
    await page.locator('input[name="phone"]').fill(account.phone);
    await page.locator('input[name="password"]').fill(account.password);
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await expect(page).toHaveURL(/\/home$/);
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('mzaya_user'))?.id)).toBe(account.id);
  }
  await page.goto('/login');
  await login();
  const token = await page.evaluate(() => localStorage.getItem('mzaya_token'));
  const label = 'Authentication recovery private address';
  const created = await request.post(`${API}/api/addresses`, { headers: { Authorization: `Bearer ${token}` }, data: { label, address: '19 Synthetic Test Street', notes: 'Private fixture', is_default: true } });
  expect(created.ok()).toBeTruthy();
  const expired = await request.get(`${API}/api/addresses`, { headers: { Authorization: `Bearer ${authRecovery.expiredToken}` } });
  expect(expired.status()).toBe(401);
  expect(await expired.json()).toMatchObject({ error: 'Invalid or expired token' });
  await page.evaluate(() => localStorage.setItem('mzaya_recent_searches', JSON.stringify(['private search'])));
  // Replace only the outgoing credential. The real backend verifies expiry;
  // the application still associates the response with its current session.
  const addressUrl = `${API}/api/addresses`;
  let intercepted = 0;
  const expire = async route => {
    intercepted += 1;
    await route.continue({ headers: { ...route.request().headers(), authorization: `Bearer ${authRecovery.expiredToken}` } });
  };
  await page.route(addressUrl, expire);
  const rejected = page.waitForResponse(r => r.url() === addressUrl && r.status() === 401);
  await page.goto('/addresses');
  await rejected;
  await expect(page).toHaveURL(/\/login$/);
  expect(intercepted).toBeGreaterThan(0);
  await page.unroute(addressUrl, expire);
  expect(await page.evaluate(() => ({ token: localStorage.getItem('mzaya_token'), user: localStorage.getItem('mzaya_user'), recent: localStorage.getItem('mzaya_recent_searches'), persisted: JSON.parse(localStorage.getItem('mzaya_auth') || 'null')?.state ?? null }))).toMatchObject({ token: null, user: null, recent: null, persisted: { user: null, token: null } });
  await page.goto('/addresses');
  await expect(page).toHaveURL(/\/welcome$/);
  await expect(page.getByText(label, { exact: true })).toHaveCount(0);
  await page.goto('/login');
  await login();
  await page.goto('/addresses');
  await expect(page.getByText(label, { exact: true })).toBeVisible();
});
