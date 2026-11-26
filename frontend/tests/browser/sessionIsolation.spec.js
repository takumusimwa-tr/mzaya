import { test, expect } from '@playwright/test';
const API = 'http://127.0.0.1:5107';
const WEB = 'http://127.0.0.1:5177';

test('same browser account switch isolates saved addresses and session data', async ({ page, request }) => {
  const fixtures = await request.get(`${API}/__browser/fixtures`);
  expect(fixtures.ok()).toBeTruthy();
  const { accounts, checkout } = await fixtures.json();
  await page.route('**/*', route => [WEB, API].includes(new URL(route.request().url()).origin) ? route.continue() : route.abort());
  async function login(account) {
    await page.locator('input[name="phone"]').fill(account.phone);
    await page.locator('input[name="password"]').fill(account.password);
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await expect(page).toHaveURL(/\/home$/);
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('mzaya_user'))?.id)).toBe(account.id);
  }
  await page.goto('/login');
  await login(accounts.customer);
  const token = await page.evaluate(() => localStorage.getItem('mzaya_token'));
  const label = 'Private session isolation address';
  const created = await request.post(`${API}/api/addresses`, { headers: { Authorization: `Bearer ${token}` }, data: { label, address: '17 Synthetic Test Street', notes: 'Private fixture', is_default: true } });
  expect(created.ok()).toBeTruthy();
  // SPA navigation keeps the first session's query cache alive until logout.
  await page.getByRole('button', { name: 'Account', exact: true }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await page.getByRole('button').filter({ has: page.getByText('Saved Addresses', { exact: true }) }).click();
  await expect(page).toHaveURL(/\/addresses$/);
  await expect(page.getByText(label, { exact: true })).toBeVisible();
  await page.evaluate(() => localStorage.setItem('mzaya_recent_searches', JSON.stringify(['private search'])));
  await page.getByRole('button', { name: 'Back to profile', exact: true }).click();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => localStorage.getItem('mzaya_token'))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem('mzaya_recent_searches'))).toBeNull();
  await login(checkout.accounts.customer);
  await page.getByRole('button', { name: 'Account', exact: true }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await page.getByRole('button').filter({ has: page.getByText('Saved Addresses', { exact: true }) }).click();
  await expect(page).toHaveURL(/\/addresses$/);
  await expect(page.getByText('No saved addresses', { exact: true })).toBeVisible();
  await expect(page.getByText(label, { exact: true })).toHaveCount(0);
});
