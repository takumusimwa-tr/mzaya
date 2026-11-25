const request = require('supertest');
const { sequelize, models, resetDatabase, closeDatabase, makeCity, makeUser, makeRider, makeOrder, makeVendor, tokenFor } = require('./setup');
const { seedFinance } = require('./financeE2E.helpers');
const app = require('../src/app');
const auth = user => ({ Authorization: `Bearer ${tokenFor(user)}` });
beforeAll(async () => {
  for (const raw of [process.env.TEST_DB_URL, process.env.DB_URL]) {
    const u = new URL(raw || '');
    if (!['postgres:', 'postgresql:'].includes(u.protocol) || !['localhost', '127.0.0.1'].includes(u.hostname) || u.pathname !== '/mzaya_integration_test' || u.search || u.hash) throw new Error('Unsafe integration database');
  }
  const [rows] = await sequelize.query('SELECT current_database() AS name');
  expect(rows[0].name).toBe('mzaya_integration_test');
  await resetDatabase();
  await seedFinance();
});
afterAll(closeDatabase);
async function fixture() {
  const city = await makeCity();
  const customer = await makeUser('customer');
  const rider = await makeUser('rider');
  const vendor = await makeUser('vendor');
  const { branch } = await makeVendor(vendor, city);
  await makeRider(rider, city);
  const order = await makeOrder(customer, city, { rider_id: rider.id, status: 'en_route', tip_usd: 0 });
  await models.OrderFood.create({ order_id: order.id, restaurant_id: branch.id, restaurant_name: 'Test Kitchen', items: [] });
  return { customer, rider, vendor, order, url: `/api/delivery-proof/orders/${order.id}` };
}
const body = { proof_type: 'photo', photo_url: 'https://example.com/proof.jpg', recipient_phone: '12345' };
test('authentication, role and ownership gates protect both read routes and submission', async () => {
  const f = await fixture();
  const stranger = await makeUser('customer');
  const otherRider = await makeUser('rider');
  const otherVendor = await makeUser('vendor');
  for (const url of [f.url, `${f.url}/timeline`]) {
    expect((await request(app).get(url)).status).toBe(401);
    for (const user of [stranger, otherRider, otherVendor]) expect((await request(app).get(url).set(auth(user))).status).toBe(403);
  }
  expect((await request(app).post(f.url).send(body)).status).toBe(401);
  for (const user of [f.customer, otherRider, f.vendor]) expect((await request(app).post(f.url).set(auth(user)).send(body)).status).toBe(403);
});
test('assigned rider completes and replays; related readers see scoped evidence and timeline', async () => {
  const f = await fixture();
  const admin = await makeUser('admin');
  const first = await request(app).post(f.url).set(auth(f.rider)).send(body);
  expect(first.status).toBe(201);
  const replay = await request(app).post(f.url).set(auth(f.rider)).send(body);
  expect(replay.status).toBe(200);
  expect(replay.body.proof.id).toBe(first.body.proof.id);
  for (const user of [f.customer, f.rider, f.vendor, admin]) {
    const response = await request(app).get(f.url).set(auth(user));
    expect(response.status).toBe(200);
    expect(response.body.proof.id).toBe(first.body.proof.id);
    if (user.role === 'vendor') {
      expect(response.body.proof).not.toHaveProperty('recipient_phone');
      expect(response.body.proof).not.toHaveProperty('photo_url');
    }
    const timeline = await request(app).get(`${f.url}/timeline`).set(auth(user));
    expect(timeline.status).toBe(200);
    expect(timeline.body.events).toHaveLength(1);
    expect(timeline.body.events[0].to_status).toBe('delivered');
  }
  const conflict = await request(app).post(f.url).set(auth(f.rider)).send({ ...body, photo_url: 'https://example.com/other.jpg' });
  expect(conflict.status).toBe(409);
  expect(conflict.body.code).toBe('PROOF_CONFLICT');
});
test('invalid UUID, forged OTP and unsafe URL schemes are rejected', async () => {
  const f = await fixture();
  expect((await request(app).get('/api/delivery-proof/orders/not-a-uuid').set(auth(f.customer))).status).toBe(400);
  for (const payload of [{ ...body, otp_verified: true }, { proof_type: 'otp' }, { ...body, photo_url: 'http://example.com/photo' }]) {
    expect((await request(app).post(f.url).set(auth(f.rider)).send(payload)).status).toBe(400);
  }
  await f.order.reload();
  expect(f.order.status).toBe('en_route');
});
