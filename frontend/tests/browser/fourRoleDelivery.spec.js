import { test, expect } from '@playwright/test';
const API = 'http://127.0.0.1:5107';
const WEB = 'http://127.0.0.1:5177';

async function login(browser, account, role, contexts) {
  const context = await browser.newContext({ baseURL: WEB, serviceWorkers: 'block' });
  contexts.push(context);
  await context.route('**/*', route => [WEB, API].includes(new URL(route.request().url()).origin) ? route.continue() : route.abort());
  const page = await context.newPage();
  await page.goto('/login');
  await page.locator('input[name="phone"]').fill(account.phone);
  await page.locator('input[name="password"]').fill(account.password);
  const response = page.waitForResponse(r => r.url() === `${API}/api/auth/login` && r.request().method() === 'POST');
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  expect((await response).status()).toBe(200);
  await expect(page).toHaveURL(new RegExp(`/${role === 'customer' ? 'home' : role}$`));
  const token = await page.evaluate(() => localStorage.getItem('mzaya_token'));
  expect(token).toBeTruthy();
  const headers = { Authorization: `Bearer ${token}` };
  const me = await context.request.get(`${API}/api/auth/me`, { headers });
  expect(me.ok()).toBeTruthy();
  expect((await me.json()).user).toMatchObject({ id: account.id, role });
  return { page, request: context.request, headers };
}

async function history(page) {
  const region = page.getByRole('region', { name: 'Recorded delivery history' });
  await expect(region.getByRole('listitem')).toHaveCount(3);
  await expect(region.getByRole('listitem')).toHaveText([/Picked up/, /On the way/, /Delivered/]);
  await expect(page.getByRole('region', { name: 'Delivery evidence' })).toContainText('Recipient confirmation');
}

test('paid order completed in rider browser and inspected by all four roles', async ({ browser, request }) => {
  test.setTimeout(120000);
  const contexts = [];
  try {
    const fixtures = await request.get(`${API}/__browser/fixtures`);
    expect(fixtures.ok()).toBeTruthy();
    const { accounts, city, catalog } = await fixtures.json();
    const customer = await login(browser, accounts.customer, 'customer', contexts);
    const rider = await login(browser, accounts.rider, 'rider', contexts);
    const vendor = await login(browser, accounts.vendor, 'vendor', contexts);
    const admin = await login(browser, accounts.admin, 'admin', contexts);
    const placed = await customer.request.post(`${API}/api/orders`, { headers: customer.headers, data: {
      client_request_id: await customer.page.evaluate(() => crypto.randomUUID()),
      category_type: 'food', city: city.slug, pickup_address: '1 Vendor St', dropoff_address: '9 Customer Ave',
      dropoff_location: { lat: -17.82, lng: 31.05 }, payment_method: 'ecocash', tip_usd: 0,
      detail: { items: [{ menu_item_id: catalog.itemId, name: catalog.itemName, qty: 2, unit_price_usd: 5, weight_kg: 0 }], total_weight_kg: 0, restaurant_id: catalog.branchId, restaurant_name: 'Test Kitchen' },
    } });
    expect(placed.status()).toBe(201);
    const { order } = await placed.json();
    expect(order.status).toBe('accepted');
    const id = order.id;
    const paid = await customer.request.post(`${API}/api/payments/${id}/pay`, { headers: customer.headers, data: { payment_method: 'ecocash', payment_phone: '0771234567' } });
    expect(paid.status()).toBe(200);
    await expect.poll(async () => {
      const response = await customer.request.get(`${API}/api/payments/${id}/poll`, { headers: customer.headers });
      expect(response.status()).toBe(200);
      return (await response.json()).paid;
    }, { timeout: 20000, intervals: [1000] }).toBe(true);
    await rider.page.goto(`/rider/delivery/${id}`);
    await rider.page.getByRole('button', { name: 'Mark as Picked Up', exact: true }).click();
    await rider.page.getByRole('button', { name: 'Start Delivery', exact: true }).click();
    await rider.page.getByRole('button', { name: 'Mark as Delivered', exact: true }).click();
    await rider.page.getByPlaceholder('Name of person receiving the order').fill('Browser fixture recipient');
    await rider.page.getByPlaceholder('Optional handover details').fill('Browser fixture handover');
    const proofPath = `${API}/api/delivery-proof/orders/${id}`;
    const completed = rider.page.waitForResponse(r => r.url() === proofPath && r.request().method() === 'POST');
    await rider.page.getByRole('button', { name: 'Complete delivery', exact: true }).click();
    const response = await completed;
    expect(response.status()).toBe(201);
    const result = await response.json();
    expect(result.order.status).toBe('delivered');
    await history(rider.page);
    await customer.page.goto(`/orders/${id}`);
    await history(customer.page);
    await vendor.page.goto('/vendor/orders');
    await vendor.page.getByRole('button', { name: /Completed/ }).click();
    await history(vendor.page);
    await expect(vendor.page.getByText('Browser fixture recipient', { exact: false })).toHaveCount(0);
    await admin.page.goto('/admin');
    await admin.page.getByRole('button', { name: 'Delivery', exact: true }).click();
    await admin.page.getByLabel('Order UUID').fill(id);
    await admin.page.getByRole('button', { name: 'Inspect order' }).click();
    await history(admin.page);
    await expect(admin.page.getByText('Recipient: Browser fixture recipient', { exact: true })).toBeVisible();
    for (const actor of [customer, rider, vendor, admin]) {
      const proof = await actor.request.get(proofPath, { headers: actor.headers });
      expect(proof.status()).toBe(200);
      const body = (await proof.json()).proof;
      expect(body.id).toBe(result.proof.id);
      if (actor === vendor) expect(Object.keys(body).sort()).toEqual(['captured_at', 'id', 'order_id', 'proof_type']);
    }
  } finally {
    await Promise.all(contexts.map(context => context.close()));
  }
});
