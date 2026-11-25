const { sequelize, models, resetDatabase, closeDatabase, makeCity, makeUser, makeRider, makeOrder } = require('./setup');
const { seedFinance } = require('./financeE2E.helpers');
const { updateOrderStatus } = require('../src/services/order.service');
const { submitDeliveryProof } = require('../src/services/deliveryProof.service');
const { DeliveryProof, OrderTimeline, FinanceOutboxEvent, OrderEconomics } = models;

beforeAll(async () => {
  for (const raw of [process.env.TEST_DB_URL, process.env.DB_URL]) {
    const u = new URL(raw || '');
    if (!['postgres:', 'postgresql:'].includes(u.protocol) || !['localhost', '127.0.0.1'].includes(u.hostname) || u.pathname !== '/mzaya_integration_test' || u.search || u.hash) {
      throw new Error('Unsafe integration database');
    }
  }
  const [rows] = await sequelize.query('SELECT current_database() AS name');
  expect(rows[0].name).toBe('mzaya_integration_test');
  await resetDatabase();
  await seedFinance();
});
afterAll(async () => { await closeDatabase(); });

async function fixture() {
  const city = await makeCity();
  const customer = await makeUser('customer');
  const user = await makeUser('rider');
  const rider = await makeRider(user, city);
  const order = await makeOrder(customer, city, { rider_id: user.id, status: 'en_route', tip_usd: 0 });
  const payload = { orderId: order.id, riderUserId: user.id, proofType: 'photo', photoUrl: `fixture://proof/${order.id}` };
  return { order, rider, user, payload };
}
async function assertState(f, completed) {
  const n = completed ? 1 : 0;
  await f.order.reload();
  await f.rider.reload();
  expect(f.order.status).toBe(completed ? 'delivered' : 'en_route');
  expect(Number(f.rider.total_deliveries)).toBe(n);
  expect(Number(f.rider.total_earnings_usd)).toBe(n * 3);
  const where = { order_id: f.order.id };
  expect(await DeliveryProof.count({ where })).toBe(n);
  expect(await OrderTimeline.count({ where: { ...where, to_status: 'delivered' } })).toBe(n);
  expect(await OrderEconomics.count({ where })).toBe(n);
  for (const prefix of ['order', 'delivery']) {
    expect(await FinanceOutboxEvent.count({ where: { idempotency_key: `${prefix}:${f.order.id}:completed:v1` } })).toBe(n);
  }
}
function legacy(f) { return updateOrderStatus(f.order.id, 'delivered', f.user.id, f.payload.photoUrl); }
function structured(f) { return submitDeliveryProof(f.payload); }

test('simultaneous structured submissions complete exactly once', async () => {
  const f = await fixture();
  const results = await Promise.all([structured(f), structured(f)]);
  expect(results.map(r => r.replayed).sort()).toEqual([false, true]);
  expect(results[0].proof.id).toBe(results[1].proof.id);
  await assertState(f, true);
});
test('legacy and structured completion share one set of effects', async () => {
  const f = await fixture();
  await Promise.all([legacy(f), structured(f)]);
  await assertState(f, true);
});
test('conflicting structured replay cannot change completed proof', async () => {
  const f = await fixture();
  await structured(f);
  await expect(submitDeliveryProof({ ...f.payload, photoUrl: 'fixture://different' })).rejects.toMatchObject({ status: 409 });
  expect((await DeliveryProof.findOne({ where: { order_id: f.order.id } })).photo_url).toBe(f.payload.photoUrl);
  await assertState(f, true);
});
test('unassigned rider cannot complete through either service', async () => {
  const f = await fixture();
  const other = await makeUser('rider');
  await expect(submitDeliveryProof({ ...f.payload, riderUserId: other.id })).rejects.toMatchObject({ status: 403 });
  await expect(updateOrderStatus(f.order.id, 'delivered', other.id, f.payload.photoUrl)).rejects.toThrow('Access denied');
  await assertState(f, false);
});
for (const [name, model] of [['proof', DeliveryProof], ['finance outbox', FinanceOutboxEvent], ['timeline', OrderTimeline]]) {
  for (const [path, complete] of [['legacy', legacy], ['structured', structured]]) {
    test(`${path}: ${name} failure rolls back and permits retry`, async () => {
      const f = await fixture();
      const hook = `delivery-test-${name}`;
      model.addHook('beforeCreate', hook, () => { throw new Error('injected delivery failure'); });
      try {
        await expect(complete(f)).rejects.toThrow('injected delivery failure');
      } finally {
        model.removeHook('beforeCreate', hook);
      }
      await assertState(f, false);
      await complete(f);
      await assertState(f, true);
    });
  }
}
