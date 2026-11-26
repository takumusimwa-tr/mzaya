import { test, expect } from '@playwright/test';
const API = 'http://127.0.0.1:5107';
const WEB = 'http://127.0.0.1:5177';

test('checkout recovers a committed order after a lost response without duplicates', async ({ browser, request }) => {
  test.setTimeout(120000);
  const fixtures = await request.get(`${API}/__browser/fixtures`);
  expect(fixtures.ok()).toBeTruthy();
  const { accounts, catalog, city } = (await fixtures.json()).resilience;
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
    const attempts = [];
    let committedOrder;
    let firstStatus;
    await page.route(`${API}/api/orders`, async route => {
      if (route.request().method() !== 'POST') return route.continue();
      attempts.push(route.request().postDataJSON());
      const response = await route.fetch({ maxRetries: 0 });
      if (attempts.length === 1) {
        firstStatus = response.status();
        committedOrder = (await response.json()).order;
        // The server committed, but the browser never receives its response.
        await route.abort('failed');
      } else {
        await route.fulfill({ response });
      }
    });
    // Two synchronous clicks exercise the submission lock before React rerenders.
    await place.evaluate(button => { button.click(); button.click(); });
    await expect(page.getByRole('alert')).toContainText('Could not confirm your order');
    expect(firstStatus).toBe(201);
    expect(committedOrder).toBeTruthy();
    expect(attempts).toHaveLength(1);
    await expect(place).toBeEnabled();
    const replay = page.waitForResponse(r => r.url() === `${API}/api/orders` && r.request().method() === 'POST');
    await place.click();
    const replayResponse = await replay;
    expect(replayResponse.status()).toBe(200);
    const { order } = await replayResponse.json();
    expect(order.id).toBe(committedOrder.id);
    expect(attempts).toHaveLength(2);
    expect(attempts[0].client_request_id).toBeTruthy();
    expect(attempts[1]).toEqual(attempts[0]);
    await expect(page).toHaveURL(new RegExp(`/orders/${order.id}$`));
    const token = await page.evaluate(() => localStorage.getItem('mzaya_token'));
    const listed = await context.request.get(`${API}/api/orders/my`, { headers: { Authorization: `Bearer ${token}` } });
    expect(listed.ok()).toBeTruthy();
    const { orders } = await listed.json();
    expect(orders).toHaveLength(1);
    expect(orders[0].id).toBe(order.id);
    expect(order).toMatchObject({ customer_id: accounts.customer.id, city: city.slug, status: 'accepted', rider_id: accounts.rider.id });
    expect(Number(order.total_usd)).toBe(Number(quote.total_usd));
    await page.reload();
    await expect(page).toHaveURL(new RegExp(`/orders/${order.id}$`));
    await page.getByRole('button', { name: /EcoCash/ }).click();
    await page.getByPlaceholder('07X XXX XXXX').fill('0771234567');
    const paid = page.waitForResponse(r => r.url() === `${API}/api/payments/${order.id}/pay` && r.request().method() === 'POST');
    await page.getByRole('button', { name: /^Pay US\$/ }).click();
    expect((await paid).status()).toBe(200);
    await expect(page.getByText('Paid with ecocash', { exact: true })).toBeVisible({ timeout: 30000 });
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
