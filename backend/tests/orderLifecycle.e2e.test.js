// End-to-end order lifecycle — the acceptance test, driven through the real API
// with real Socket.IO clients, exactly as the customer, vendor and Mzaya screens
// drive it.
//
// Why this exists: every other test builds orders with factories, so nothing
// exercised order PLACEMENT, and nothing checked that live events actually
// arrive. Three regressions slipped through that gap in one batch:
//   • a chat router mounted on /api/orders swallowed /orders/:id, /my, /vendor
//     and /available;
//   • dispatch.service.js was replaced, so placing any order threw;
//   • socket publishing moved modules and every status emit silently failed.
// This test fails loudly on all three.
const http = require('http');
const request = require('supertest');
const { io: Client } = require('socket.io-client');
const app = require('../src/app');
const { initSocket } = require('../src/realtime/socket');
const { Rider } = require('../src/models/associations');
const {
  resetDatabase, makeCity, makeUser, makeVendor, makeMenuItem, makeRider, tokenFor,
} = require('./setup');

const EVENTS = ['order:new', 'order:available', 'order:assigned', 'order:status_changed'];

let server;
let url;
const sockets = [];

beforeAll(async () => {
  server = http.createServer(app);
  initSocket(server);
  await new Promise((resolve) => server.listen(0, resolve));
  url = `http://localhost:${server.address().port}`;
});

afterEach(() => {
  while (sockets.length) sockets.pop().close();
});

afterAll(() => new Promise((resolve) => server.close(resolve)));

beforeEach(resetDatabase);

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

describe('Order lifecycle (end to end)', () => {
  it('places, pays, delivers and rates an order — with live events to every party', async () => {
    const w = await world();
    const customerSeen = await listen(w.customer);
    const vendorSeen = await listen(w.vendorUser, { event: 'join:vendor', id: w.branch.id });
    const mzayaSeen = await listen(w.riderUser, { event: 'join:city', id: w.city.id });

    const placed = await request(app).post('/api/orders').set(auth(w.customer))
      .send(foodOrder(w.city, w.branch, w.item));
    expect(placed.status).toBe(201);
    const id = placed.body.order.id;

    // The routes the chat router used to swallow.
    expect((await request(app).get(`/api/orders/${id}`).set(auth(w.customer))).status).toBe(200);
    expect((await request(app).get('/api/orders/my').set(auth(w.customer))).status).toBe(200);
    expect((await request(app).get('/api/orders/vendor').set(auth(w.vendorUser))).status).toBe(200);

    // Mock EcoCash: the simulated prompt approves after a few seconds.
    const pay = await request(app).post(`/api/payments/${id}/pay`).set(auth(w.customer))
      .send({ payment_method: 'ecocash', payment_phone: '0771234567' });
    expect(pay.status).toBe(200);
    let poll;
    for (let i = 0; i < 10 && !poll?.body?.paid; i += 1) {
      await settle(1000);
      poll = await request(app).get(`/api/payments/${id}/poll`).set(auth(w.customer));
    }
    expect(poll.body.paid).toBe(true);

    // Order chat, both directions.
    expect((await request(app).post(`/api/orders/${id}/messages`).set(auth(w.customer))
      .send({ body: 'Gate is blue' })).status).toBe(201);
    const thread = await request(app).get(`/api/orders/${id}/messages`).set(auth(w.riderUser));
    expect(thread.status).toBe(200);
    expect(JSON.stringify(thread.body)).toContain('Gate is blue');

    for (const status of ['picked_up', 'en_route']) {
      const res = await request(app).patch(`/api/orders/${id}/status`).set(auth(w.riderUser)).send({ status });
      expect(res.status).toBe(200);
    }
    const delivered = await request(app).patch(`/api/orders/${id}/status`).set(auth(w.riderUser))
      .send({ status: 'delivered', delivery_proof_url: 'https://res.cloudinary.com/demo/proof.jpg' });
    expect(delivered.status).toBe(200);
    expect((await request(app).post(`/api/orders/${id}/rate`).set(auth(w.customer))
      .send({ rating: 5 })).status).toBe(200);

    const final = await request(app).get(`/api/orders/${id}`).set(auth(w.customer));
    expect(final.body.order.status).toBe('delivered');
    expect(final.body.order.payment_status).toBe('success');

    await settle();
    // Auto-assigned at placement: the vendor hears about the new order, the
    // Mzaya is told directly, and nobody else is shown a phantom job.
    expect(vendorSeen).toContain('order:new:accepted');
    expect(mzayaSeen).toContain('order:assigned:accepted');
    expect(mzayaSeen).not.toContain('order:available:accepted');
    for (const seen of [customerSeen, vendorSeen, mzayaSeen]) {
      expect(seen).toEqual(expect.arrayContaining([
        'order:status_changed:picked_up',
        'order:status_changed:en_route',
        'order:status_changed:delivered',
      ]));
    }
  }, 60000);

  it('advertises an unassigned order to the city and broadcasts the claim', async () => {
    const w = await world({ riderOnline: false }); // nobody online -> stays pending
    const customerSeen = await listen(w.customer);
    const vendorSeen = await listen(w.vendorUser, { event: 'join:vendor', id: w.branch.id });
    const mzayaSeen = await listen(w.riderUser, { event: 'join:city', id: w.city.id });

    const placed = await request(app).post('/api/orders').set(auth(w.customer))
      .send(foodOrder(w.city, w.branch, w.item));
    expect(placed.status).toBe(201);
    const id = placed.body.order.id;
    expect(placed.body.order.status).toBe('pending');

    await Rider.update({ is_online: true }, { where: { user_id: w.riderUser.id } });
    const board = await request(app).get('/api/orders/available').set(auth(w.riderUser));
    expect(board.status).toBe(200);
    expect(JSON.stringify(board.body)).toContain(id);

    const claim = await request(app).post(`/api/orders/${id}/claim`).set(auth(w.riderUser));
    expect(claim.status).toBe(200);

    await settle();
    expect(mzayaSeen).toContain('order:available:pending');
    // The accept must reach the customer and vendor live, not on next refresh.
    expect(customerSeen).toContain('order:status_changed:accepted');
    expect(vendorSeen).toContain('order:status_changed:accepted');
  }, 30000);
});
