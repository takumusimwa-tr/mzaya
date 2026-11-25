const http = require('http');
const request = require('supertest');
const { io: Client } = require('socket.io-client');
const app = require('../src/app');
const { initSocket, closeSocket } = require('../src/realtime/socket');
const { randomUUID } = require('crypto');
const { MOCK } = require('../src/services/payment.service');
const { seedFinance, drain, financeLineageForIdempotency } = require('./financeE2E.helpers');
const {
  resetDatabase, closeDatabase, models, makeCity, makeUser, makeVendor, makeMenuItem, makeRider, tokenFor,
} = require('./setup');

const EVENTS = ['order:new', 'order:available', 'order:assigned', 'order:status_changed'];

let server;
let url;
const sockets = [];

beforeAll(async () => {
  server = http.createServer(app);
  initSocket(server);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  url = `http://127.0.0.1:${server.address().port}`;
});

afterEach(() => {
  while (sockets.length) sockets.pop().close();
});

afterAll(async () => {
  try { await closeSocket(); } finally { await closeDatabase(); }
});

beforeEach(async () => {
  expect(MOCK).toBe(true);
  await resetDatabase();
  await seedFinance();
});

const auth = (user) => ({ Authorization: `Bearer ${tokenFor(user)}` });
const settle = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

// Connect as `user`, optionally join a room, and record every order event.
async function listen(user, join) {
  const socket = Client(url, { auth: { token: tokenFor(user) }, transports: ['websocket'] });
  sockets.push(socket);
  await new Promise((resolve, reject) => {
    socket.on('connect', resolve);
    socket.on('connect_error', reject);
  });
  if (join) await new Promise((resolve) => socket.emit(join.event, join.id, resolve));
  const seen = [];
  EVENTS.forEach((event) => socket.on(event, (p) => seen.push(`${event}:${p.status || ''}`)));
  return seen;
}

// The exact payload CheckoutPage sends for a food order.
function foodOrder(city, branch, item) {
  return {
    category_type: 'food',
    city: city.slug,
    pickup_address: '1 Vendor St',
    dropoff_address: '9 Customer Ave',
    dropoff_location: { lat: -17.82, lng: 31.05 },
    payment_method: 'ecocash',
    tip_usd: 0,
    detail: {
      items: [{ menu_item_id: item.id, name: item.name, qty: 2, unit_price_usd: 5, weight_kg: 0 }],
      total_weight_kg: 0,
      restaurant_id: branch.id,
      restaurant_name: 'Test Kitchen',
    },
  };
}

async function world({ riderOnline = true } = {}) {
  const city = await makeCity();
  const customer = await makeUser('customer');
  const vendorUser = await makeUser('vendor');
  const riderUser = await makeUser('rider');
  const { branch } = await makeVendor(vendorUser, city);
  const item = await makeMenuItem(branch);
  await makeRider(riderUser, city, { vehicle_type: 'motorbike', is_online: riderOnline });
  return { city, customer, vendorUser, riderUser, branch, item };
}

test('checkout, mock payment, structured delivery, four-role visibility and balanced finance', async () => {
  const w = await world();
  const admin = await makeUser('admin');
  const stranger = await makeUser('customer');
  const readers = [w.customer, w.riderUser, w.vendorUser, admin];
  const seen = [await listen(w.customer), await listen(w.riderUser),
    await listen(w.vendorUser, { event: 'join:vendor', id: w.branch.id }), await listen(admin)];
  const payload = { ...foodOrder(w.city, w.branch, w.item), client_request_id: randomUUID() };
  const placed = await request(app).post('/api/orders').set(auth(w.customer)).send(payload);
  expect(placed.status).toBe(201);
  const id = placed.body.order.id;
  expect(placed.body.order.status).toBe('accepted');
  const replay = await request(app).post('/api/orders').set(auth(w.customer)).send(payload);
  expect(replay.status).toBe(200);
  expect(replay.body.order.id).toBe(id);
  expect(await models.Order.count({ where: { customer_id: w.customer.id } })).toBe(1);
  const pay = await request(app).post(`/api/payments/${id}/pay`).set(auth(w.customer))
    .send({ payment_method: 'ecocash', payment_phone: '0771234567' });
  expect(pay.status).toBe(200);
  let poll;
  for (let i = 0; i < 10 && !poll?.body?.paid; i += 1) {
    await settle(1000);
    poll = await request(app).get(`/api/payments/${id}/poll`).set(auth(w.customer));
    expect(poll.status).toBe(200);
  }
  expect(poll.body.paid).toBe(true);
  const where = { order_id: id };
  const payment = await models.PaymentAttempt.findOne({ where: { ...where, status: 'success' } });
  expect(payment).toBeTruthy();
  expect(await models.PaymentAttempt.count({ where })).toBe(1);
  const proofPath = `/api/delivery-proof/orders/${id}`;
  for (const status of ['picked_up', 'en_route']) {
    expect((await request(app).patch(`/api/orders/${id}/status`).set(auth(w.riderUser)).send({ status })).status).toBe(200);
  }
  const evidence = { proof_type: 'recipient_confirmation', recipient_name: 'Fixture recipient', notes: 'Fixture handover' };
  expect((await request(app).post(proofPath).set(auth(w.customer)).send(evidence)).status).toBe(403);
  const done = await request(app).post(proofPath).set(auth(w.riderUser)).send(evidence);
  expect(done.status).toBe(201);
  expect(done.body.order.status).toBe('delivered');
  const again = await request(app).post(proofPath).set(auth(w.riderUser)).send(evidence);
  expect(again.status).toBe(200);
  expect(again.body.proof.id).toBe(done.body.proof.id);
  expect((await request(app).post(proofPath).set(auth(w.riderUser)).send({ ...evidence, recipient_name: 'Different' })).status).toBe(409);
  for (const user of readers) {
    const proof = await request(app).get(proofPath).set(auth(user));
    expect(proof.status).toBe(200);
    expect(proof.body.proof.id).toBe(done.body.proof.id);
    if (user.role === 'vendor') {
      expect(Object.keys(proof.body.proof).sort()).toEqual(['captured_at', 'id', 'order_id', 'proof_type']);
    }
    const history = await request(app).get(`${proofPath}/timeline`).set(auth(user));
    expect(history.status).toBe(200);
    expect(history.body.events.map(e => e.to_status)).toEqual(['picked_up', 'en_route', 'delivered']);
  }
  for (const path of [proofPath, `${proofPath}/timeline`]) {
    expect((await request(app).get(path).set(auth(stranger))).status).toBe(403);
  }
  for (let i = 0; i < 30 && !seen.every(events => events.includes('order:status_changed:delivered')); i += 1) await settle(100);
  for (const events of seen) expect(events).toContain('order:status_changed:delivered');
  const order = await models.Order.findByPk(id);
  expect(order.status).toBe('delivered');
  expect(order.payment_status).toBe('success');
  expect(await models.DeliveryProof.count({ where })).toBe(1);
  expect(await models.OrderEconomics.count({ where })).toBe(1);
  const rider = await models.Rider.findOne({ where: { user_id: w.riderUser.id } });
  expect(Number(rider.total_deliveries)).toBe(1);
  expect(Number(rider.total_earnings_usd)).toBeCloseTo(Number(order.delivery_fee_usd) + Number(order.tip_usd), 2);
  await drain();
  const keys = [`payment:${payment.id}:captured:v1`, `order:${id}:completed:v1`, `delivery:${id}:completed:v1`];
  for (const key of keys) {
    expect(await models.FinanceOutboxEvent.count({ where: { idempotency_key: key } })).toBe(1);
    const lineage = await financeLineageForIdempotency(key);
    expect(lineage.accountingEvent.status).toBe('posted');
    if (key === keys[1]) {
      expect(lineage.accountingEvent.metadata.nonPosting).toBe(true);
    } else {
      expect(lineage.ledgerTransaction).toBeTruthy();
      const entries = lineage.ledgerTransaction.entries;
      const sum = direction => entries.filter(e => e.direction === direction).reduce((n, e) => n + BigInt(e.amount_minor), 0n);
      expect(sum('debit')).toBeGreaterThan(0n);
      expect(sum('debit')).toBe(sum('credit'));
    }
  }
}, 60000);
