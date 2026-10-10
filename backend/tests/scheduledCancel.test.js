// A scheduled order can be cancelled, and the release job must never send out
// an order that was cancelled while it was deciding.
const request = require('supertest');
const app = require('../src/app');
const { Order } = require('../src/models/associations');
const { resetDatabase, makeCity, makeUser, makeOrder, tokenFor } = require('./setup');

beforeEach(resetDatabase);

describe('scheduled orders', () => {
  it('lets the customer cancel a scheduled order', async () => {
    const city = await makeCity();
    const customer = await makeUser('customer');
    const order = await makeOrder(customer, city, { status: 'scheduled', scheduled_for: new Date(Date.now() + 86400000) });

    const res = await request(app).post(`/api/orders/${order.id}/cancel`)
      .set('Authorization', `Bearer ${tokenFor(customer)}`).send({ reason: 'Plans changed' });
    expect(res.status).toBe(200);
    expect((await Order.findByPk(order.id)).status).toBe('cancelled');
  });

  it('a release that lost the race to a cancel changes nothing', async () => {
    const city = await makeCity();
    const customer = await makeUser('customer');
    const order = await makeOrder(customer, city, { status: 'scheduled', scheduled_for: new Date() });
    await order.update({ status: 'cancelled' }); // cancelled after the job read it

    // The job's conditional write, exactly as it runs:
    const [released] = await Order.update(
      { status: 'pending', rider_id: null, accepted_at: null },
      { where: { id: order.id, status: 'scheduled' } },
    );
    expect(released).toBe(0);
    expect((await Order.findByPk(order.id)).status).toBe('cancelled');
  });
});
