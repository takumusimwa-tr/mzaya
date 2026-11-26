import { test, expect } from '@playwright/test';
const API = 'http://127.0.0.1:5107';
const WEB = 'http://127.0.0.1:5177';

test('payment recovers a committed initiation after a lost response and interrupted polling', async ({ browser, request }) => {
  test.setTimeout(120000);
  const fixtures = await request.get(`${API}/__browser/fixtures`);
  expect(fixtures.ok()).toBeTruthy();
  const { accounts, catalog, city } = (await fixtures.json()).paymentRecovery;
  const context = await browser.newContext({ baseURL: WEB, serviceWorkers: 'block', permissions: ['geolocation'], geolocation: { latitude: -17.82, longitude: 31.05 } });
  try {
    await context.route('**/*', route => [WEB, API].includes(new URL(route.request().url()).origin) ? route.continue() : route.abort());
    const page = await context.newPage();
    await page.goto('/login');
    await page.locator('input[name="phone"]').fill(accounts.customer.phone);
    await page.locator('input[name="password"]').fill(accounts.customer.password);
    const login = page.waitForResponse(r => r.url() === `${API}/api/auth/login` && r.request().method() === 'POST');
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    expect((await login).status()).toBe(200);
    await expect(page).toHaveURL(/\/home$/);
    await page.getByRole('button', { name: 'Change delivery city' }).click();
    await page.getByRole('dialog', { name: 'Choose your city' }).getByRole('button', { name: city.name }).click();
    await page.getByRole('article').filter({ hasText: catalog.brandName }).getByRole('button', { name: /Open now/ }).click();
    await expect(page).toHaveURL(new RegExp(`/vendor/${catalog.branchId}(?:\\?|$)`));
    await page.getByRole('button', { name: `Add ${catalog.itemName} to cart`, exact: true }).click();
    await page.getByRole('button', { name: /View cart/ }).click();
    await expect(page).toHaveURL(/\/cart$/);
    await page.getByRole('button', { name: `One more ${catalog.itemName}`, exact: true }).click();
    const checkout = page.getByRole('button', { name: /Go to checkout/ });
    await expect(checkout).toContainText('US$10.00');
    const quoted = page.waitForResponse(r => r.url() === `${API}/api/orders/quote` && r.request().method() === 'POST');
    await checkout.click();
    const quoteResponse = await quoted;
    expect(quoteResponse.status()).toBe(200);
    const { quote } = await quoteResponse.json();
    expect(Number(quote.subtotal_usd)).toBe(10);
    await page.getByPlaceholder('House number, street and suburb').fill('12 Browser Test Avenue, Harare');
    await page.getByRole('button', { name: 'Use my location' }).click();
    await expect(page.getByText('Exact location pinned')).toBeVisible();
    const place = page.getByRole('button', { name: /Place order/ });
    await expect(place).toContainText(`US$${Number(quote.total_usd).toFixed(2)}`);
    const placed = page.waitForResponse(r => r.url() === `${API}/api/orders` && r.request().method() === 'POST');
    await place.click();
    const placedResponse = await placed;
    expect(placedResponse.status()).toBe(201);
    const { order } = await placedResponse.json();
    await expect(page).toHaveURL(new RegExp(`/orders/${order.id}$`));
    const token = await page.evaluate(() => localStorage.getItem('mzaya_token'));
    await page.getByRole('button', { name: /EcoCash/ }).click();
    await page.getByPlaceholder('07X XXX XXXX').fill('0771234567');
    const payUrl = `${API}/api/payments/${order.id}/pay`;
    const pollUrl = `${API}/api/payments/${order.id}/poll`;
    const attempts = [];
    let committed;
    let replayed;
    let blockedPolls = 0;
    await page.route(payUrl, async route => {
      if (route.request().method() !== 'POST') return route.continue();
      const requestNumber = attempts.push(route.request().postDataJSON());
      if (requestNumber === 1) {
        // Simulate a failure before the request reaches the backend.
        await route.abort('failed');
        return;
      }
      const response = await route.fetch({ maxRetries: 0 });
      const result = { status: response.status(), body: await response.json() };
      if (requestNumber === 2) {
        committed = result;
        await route.abort('failed');
      } else {
        replayed = result;
        await route.fulfill({ response });
      }
    });
    await page.route(pollUrl, async route => {
      if (blockedPolls === 0) {
        blockedPolls += 1;
        await route.abort('failed');
      } else await route.continue();
    });
    const pay = page.getByRole('button', { name: /^Pay US\$/ });
    await pay.click();
    await expect(page.getByRole('alert')).toContainText('Could not start payment');
    await expect(pay).toBeEnabled();
    expect(attempts).toHaveLength(1);
    await pay.evaluate(button => { button.click(); button.click(); });
    await expect.poll(() => committed?.status).toBe(200);
    expect(attempts).toHaveLength(2);
    await expect(page.getByRole('alert')).toContainText('Could not start payment');
    expect(committed?.status).toBe(200);
    expect(committed.body.attemptId).toBeTruthy();
    expect(attempts).toHaveLength(2);
    await page.reload();
    await expect(page).toHaveURL(new RegExp(`/orders/${order.id}$`));
    await page.getByRole('button', { name: /EcoCash/ }).click();
    await page.getByPlaceholder('07X XXX XXXX').fill('0771234567');
    const paid = page.waitForResponse(r => r.url() === payUrl && r.request().method() === 'POST');
    await pay.click();
    expect((await paid).status()).toBe(200);
    expect(replayed.body.attemptId).toBe(committed.body.attemptId);
    expect(replayed.body.reference).toBe(committed.body.reference);
    expect(attempts).toHaveLength(3);
    expect(attempts[0].idempotency_key).toBeTruthy();
    expect(attempts[1]).toEqual(attempts[0]);
    expect(attempts[2]).toEqual(attempts[0]);
    await expect(page.getByText('Paid with ecocash', { exact: true })).toBeVisible({ timeout: 30000 });
    expect(blockedPolls).toBe(1);
    await page.reload();
    await expect(page.getByText('Paid with ecocash', { exact: true })).toBeVisible();
    await expect(pay).toHaveCount(0);
    const duplicate = await context.request.post(payUrl, { headers: { Authorization: `Bearer ${token}` }, data: attempts[2] });
    expect(duplicate.status()).toBe(400);
    expect((await duplicate.json()).error).toBe('Order already paid');
    const saved = await context.request.get(`${API}/api/orders/${order.id}`, { headers: { Authorization: `Bearer ${token}` } });
    expect(saved.ok()).toBeTruthy();
    const persisted = (await saved.json()).order;
    expect(persisted).toMatchObject({ payment_status: 'success', rider_id: accounts.rider.id, status: 'accepted' });
    expect(persisted.foodDetail.restaurant_id).toBe(catalog.branchId);
    expect(persisted.foodDetail.items).toHaveLength(1);
    expect(Number(persisted.foodDetail.items[0].qty)).toBe(2);
    await expect(page.getByText('A Mzaya is on it', { exact: true })).toBeVisible();
    await page.goto('/cart');
    await expect(page.getByText('Your cart is empty', { exact: true })).toBeVisible();
  } finally {
    await context.close();
  }
});
