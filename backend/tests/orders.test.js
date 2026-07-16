const request = require('supertest');
const app = require('../src/app');
const {
  models, resetDatabase,
  makeCity, makeUser, makeVendor, makeMenuItem, makeRider, makeOrder, tokenFor,
} = require('./setup');

const { Order } = models;

beforeAll(resetDatabase);

describe('Claiming an order — the race condition', () => {
  // THE bug. Claiming was check-then-act:
  //
  //   const order = await Order.findByPk(id);
  //   if (order.rider_id) return 409;          // check
  //   await order.update({ rider_id: me });    // act
  //
  // Two Mzayas tapping Accept milliseconds apart both read rider_id as null, both
  // pass the check, and both write. One silently overwrites the other — and a
  // Mzaya drives to a pickup that isn't theirs.
  //
  // The fix is an atomic conditional UPDATE ... WHERE rider_id IS NULL. This test
  // fires both claims concurrently and asserts the database picked exactly one
  // winner. It CANNOT pass against the old code.
  it('lets exactly ONE of two concurrent claims win', async () => {
    const city = await makeCity();
    const customer = await makeUser('customer');
    const order = await makeOrder(customer, city, { vehicle_type: 'motorbike' });

    const userA = await makeUser('rider');
    const userB = await makeUser('rider');
    await makeRider(userA, city);
    await makeRider(userB, city);

    // Fire simultaneously — no await between them.
    const [resA, resB] = await Promise.all([
      request(app).post(`/api/orders/${order.id}/claim`)
        .set('Authorization', `Bearer ${tokenFor(userA)}`),
      request(app).post(`/api/orders/${order.id}/claim`)
        .set('Authorization', `Bearer ${tokenFor(userB)}`),
    ]);

    const statuses = [resA.status, resB.status].sort();

    // One wins (200), one is told it's gone (409). Never two winners.
    expect(statuses).toEqual([200, 409]);

    // And the database agrees: exactly one Mzaya holds it.
    const fresh = await Order.findByPk(order.id);
    expect(fresh.rider_id).toBeTruthy();
    expect([userA.id, userB.id]).toContain(fresh.rider_id);
    expect(fresh.status).toBe('accepted');
  });

  it('refuses a second claim on an already-claimed order', async () => {
    const city = await makeCity();
    const customer = await makeUser('customer');
    const order = await makeOrder(customer, city, { vehicle_type: 'motorbike' });

    const first = await makeUser('rider');
    const second = await makeUser('rider');
    await makeRider(first, city);
    await makeRider(second, city);

    const a = await request(app).post(`/api/orders/${order.id}/claim`)
      .set('Authorization', `Bearer ${tokenFor(first)}`);
    expect(a.status).toBe(200);

    const b = await request(app).post(`/api/orders/${order.id}/claim`)
      .set('Authorization', `Bearer ${tokenFor(second)}`);
    expect(b.status).toBe(409);
  });

  it('refuses a Mzaya whose vehicle is too small for the load', async () => {
    const city = await makeCity();
    const customer = await makeUser('customer');
    // A truck job. Note the vehicle spectrum is granular — there's no plain
    // 'truck'; it's truck_2t / truck_5t / truck_7t / truck_10t.
    const order = await makeOrder(customer, city, {
      category_type: 'materials',
      vehicle_type: 'truck_5t',
    });

    const user = await makeUser('rider');
    await makeRider(user, city, { vehicle_type: 'motorbike' });

    const res = await request(app).post(`/api/orders/${order.id}/claim`)
      .set('Authorization', `Bearer ${tokenFor(user)}`);

    // A bike cannot carry a tonne of cement, and the server — not the UI — must
    // be the thing that says so.
    expect(res.status).toBe(403);
  });

  it('refuses an unapproved Mzaya', async () => {
    const city = await makeCity();
    const customer = await makeUser('customer');
    const order = await makeOrder(customer, city, { vehicle_type: 'motorbike' });

    const user = await makeUser('rider');
    await makeRider(user, city, { is_approved: false });

    const res = await request(app).post(`/api/orders/${order.id}/claim`)
      .set('Authorization', `Bearer ${tokenFor(user)}`);

    expect(res.status).toBe(403);
  });
});

describe('Order status transitions', () => {
  it('only lets the assigned Mzaya update the status', async () => {
    const city = await makeCity();
    const customer = await makeUser('customer');
    const order = await makeOrder(customer, city, { vehicle_type: 'motorbike' });

    const assigned = await makeUser('rider');
    const stranger = await makeUser('rider');
    await makeRider(assigned, city);
    await makeRider(stranger, city);

    await request(app).post(`/api/orders/${order.id}/claim`)
      .set('Authorization', `Bearer ${tokenFor(assigned)}`);

    // A different Mzaya must not be able to move someone else's delivery.
    const res = await request(app)
      .patch(`/api/orders/${order.id}/status`)
      .set('Authorization', `Bearer ${tokenFor(stranger)}`)
      .send({ status: 'picked_up' });

    expect(res.status).toBe(403);
  });

  it('requires a proof photo to mark an order delivered', async () => {
    const city = await makeCity();
    const customer = await makeUser('customer');
    const order = await makeOrder(customer, city, { vehicle_type: 'motorbike' });

    const rider = await makeUser('rider');
    await makeRider(rider, city);
    const auth = { Authorization: `Bearer ${tokenFor(rider)}` };

    await request(app).post(`/api/orders/${order.id}/claim`).set(auth);
    await request(app).patch(`/api/orders/${order.id}/status`).set(auth).send({ status: 'picked_up' });
    await request(app).patch(`/api/orders/${order.id}/status`).set(auth).send({ status: 'en_route' });

    // No photo → refused.
    const without = await request(app)
      .patch(`/api/orders/${order.id}/status`).set(auth)
      .send({ status: 'delivered' });
    expect(without.status).toBe(400);

    // With a photo → accepted.
    const withPhoto = await request(app)
      .patch(`/api/orders/${order.id}/status`).set(auth)
      .send({ status: 'delivered', delivery_proof_url: 'https://example.com/proof.jpg' });
    expect(withPhoto.status).toBe(200);

    const fresh = await Order.findByPk(order.id);
    expect(fresh.status).toBe('delivered');
    expect(fresh.delivery_proof_url).toBeTruthy();
  });
});
