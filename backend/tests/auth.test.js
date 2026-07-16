const request = require('supertest');
const app = require('../src/app');
const {
  resetDatabase,
  makeCity, makeUser, makeVendor, makeOrder, tokenFor,
} = require('./setup');

beforeAll(resetDatabase);

describe('Auth', () => {
  it('registers a customer and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Tendai', phone: '0771000001', password: 'test1234' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.role).toBe('customer');
    // The password must never come back out.
    expect(res.body.user.password).toBeUndefined();
  });

  it('rejects a duplicate phone number', async () => {
    await request(app).post('/api/auth/register')
      .send({ name: 'A', phone: '0771000002', password: 'test1234' });

    const res = await request(app).post('/api/auth/register')
      .send({ name: 'B', phone: '0771000002', password: 'test1234' });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('rejects a wrong password', async () => {
    await request(app).post('/api/auth/register')
      .send({ name: 'C', phone: '0771000003', password: 'test1234' });

    const res = await request(app).post('/api/auth/login')
      .send({ phone: '0771000003', password: 'wrong-password' });

    expect(res.status).toBe(401);
    expect(res.body.token).toBeUndefined();
  });

  it('refuses an unauthenticated request', async () => {
    const res = await request(app).get('/api/orders/my');
    expect(res.status).toBe(401);
  });

  it('refuses a forged token', async () => {
    const res = await request(app)
      .get('/api/orders/my')
      .set('Authorization', 'Bearer not-a-real-token');

    expect(res.status).toBe(401);
  });
});

describe('Authorization — the vendor read hole', () => {
  // This is the live vulnerability we found: getOrderById checked customers and
  // riders, then FELL THROUGH for vendors. Any vendor could read any order in the
  // system — a competitor's customer names, phone numbers, addresses, totals —
  // just by changing the UUID in the URL.
  //
  // If this test ever fails, that hole is back.
  it('does NOT let a vendor read an order belonging to another vendor', async () => {
    const city = await makeCity();

    const customer = await makeUser('customer');
    const order = await makeOrder(customer, city);

    // A completely unrelated vendor.
    const outsider = await makeUser('vendor');
    await makeVendor(outsider, city);

    const res = await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Authorization', `Bearer ${tokenFor(outsider)}`);

    expect(res.status).toBe(403);
    expect(res.body.order).toBeUndefined();
  });

  it('does NOT let a customer read another customer\'s order', async () => {
    const city = await makeCity();
    const owner = await makeUser('customer');
    const other = await makeUser('customer');
    const order = await makeOrder(owner, city);

    const res = await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Authorization', `Bearer ${tokenFor(other)}`);

    expect(res.status).toBe(403);
  });

  it('DOES let the owning customer read their own order', async () => {
    const city = await makeCity();
    const customer = await makeUser('customer');
    const order = await makeOrder(customer, city);

    const res = await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Authorization', `Bearer ${tokenFor(customer)}`);

    expect(res.status).toBe(200);
    expect(res.body.order.id).toBe(order.id);
  });

  it('does NOT let a customer reach the admin endpoints', async () => {
    const customer = await makeUser('customer');

    const res = await request(app)
      .get('/api/admin/overview')
      .set('Authorization', `Bearer ${tokenFor(customer)}`);

    expect(res.status).toBe(403);
  });
});

describe('Authorization — chat contacts leak phone numbers', () => {
  // The chat routes had NO ownership guard. /contacts returns PHONE NUMBERS, so
  // anyone signed in could have walked the UUID space and harvested customer and
  // Mzaya numbers.
  it('does NOT expose contacts on an order you have nothing to do with', async () => {
    const city = await makeCity();
    const customer = await makeUser('customer');
    const stranger = await makeUser('customer');
    const order = await makeOrder(customer, city);

    const res = await request(app)
      .get(`/api/orders/${order.id}/contacts`)
      .set('Authorization', `Bearer ${tokenFor(stranger)}`);

    expect(res.status).toBe(403);
    expect(JSON.stringify(res.body)).not.toMatch(/07\d{8}/);
  });
});
