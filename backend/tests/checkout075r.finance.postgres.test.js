'use strict';
// Disposable-local-PostgreSQL-only: real service delivery, outbox, economics and earnings.
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { sequelize } = require('../src/config/db');
const {
  City, User, Rider, Vendor, MenuItem, Order, OrderFood,
  FinanceOutboxEvent, OrderEconomics,
} = require('../src/models/associations');
const { createOrder, updateOrderStatus } = require('../src/services/order.service');

const tag = randomUUID().replace(/-/g, '').slice(0, 20);
const cityName = `finance-r-${tag}`;
const ids = {};
const orderIds = new Set();
const proof = `fixture://07.5r/${tag}/delivery-proof`;

function assertLocalDatabase() {
  assert.equal(process.env.CHECKOUT_FINANCE_CONFIRM, 'DISPOSABLE_LOCAL_DATABASE_ONLY',
    'Explicit disposable DB confirmation required');
  assert.ok(process.env.DB_URL, 'DB_URL required');
  const url = new URL(process.env.DB_URL);
  assert.ok(['localhost', '127.0.0.1', '::1', '[::1]'].includes(url.hostname),
    'Remote database refused');
  assert.equal(url.pathname, '/mzaya', 'Only disposable local mzaya DB permitted');
}

async function cleanup() {
  const owned = [...orderIds];
  if (ids.customer) {
    const extra = await Order.findAll({ where: { customer_id: ids.customer }, attributes: ['id'], raw: true });
    for (const row of extra) owned.push(row.id);
  }
  const unique = [...new Set(owned)];
  if (unique.length) {
    await sequelize.transaction(async transaction => {
      await FinanceOutboxEvent.destroy({ where: { aggregate_type: 'order', aggregate_id: unique }, transaction });
      await OrderEconomics.destroy({ where: { order_id: unique }, transaction });
      await OrderFood.destroy({ where: { order_id: unique }, transaction });
      await Order.destroy({ where: { id: unique, customer_id: ids.customer }, transaction });
    });
  }
  if (ids.item) await MenuItem.destroy({ where: { id: ids.item } });
  if (ids.vendor) await Vendor.destroy({ where: { id: ids.vendor } });
  if (ids.rider) await Rider.destroy({ where: { id: ids.rider } });
  if (ids.riderUser) await User.destroy({ where: { id: ids.riderUser } });
  if (ids.owner) await User.destroy({ where: { id: ids.owner } });
  if (ids.customer) await User.destroy({ where: { id: ids.customer } });
  if (ids.city) await City.destroy({ where: { id: ids.city } });
}

function payload() {
  return {
    client_request_id: randomUUID(), category_type: 'food', city: cityName,
    pickup_address: '07.5R isolated pickup', dropoff_address: '07.5R isolated dropoff',
    payment_method: 'ecocash', tip_usd: 1.25, is_negotiable: true,
    detail: { restaurant_id: ids.vendor, restaurant_name: cityName,
      items: [{ menu_item_id: ids.item, qty: 1, unit_price_usd: 0.01 }] },
  };
}

async function readyOrder() {
  const created = await createOrder(ids.customer, payload());
  const id = created.order.id;
  orderIds.add(id);
  await Order.update({ status: 'accepted', rider_id: ids.riderUser }, { where: { id } });
  await updateOrderStatus(id, 'picked_up', ids.riderUser);
  await updateOrderStatus(id, 'en_route', ids.riderUser);
  return id;
}

async function main() {
  assertLocalDatabase();
  const [[db]] = await sequelize.query('SELECT current_database() AS name');
  assert.equal(db.name, 'mzaya');
  // Explicit schema preflight. Never migrate or sync automatically.
  const [[schema]] = await sequelize.query(`
    SELECT
      to_regclass('public.finance_outbox_events')::text AS outbox,
      to_regclass('public.order_economics')::text AS economics,
      to_regclass('public.orders')::text AS orders,
      to_regclass('public.riders')::text AS riders
  `);
  for (const [key, name] of Object.entries({
    outbox: 'finance_outbox_events',
    economics: 'order_economics',
    orders: 'orders',
    riders: 'riders'
  })) {
    assert.ok(schema[key], `Missing table ${name}; do not run all pending migrations`);
  }
  const [indexes] = await sequelize.query(`SELECT indexdef FROM pg_indexes
    WHERE schemaname = 'public' AND tablename = 'finance_outbox_events'`);
  assert.ok(indexes.some(i => /UNIQUE INDEX/i.test(i.indexdef) && /idempotency_key/.test(i.indexdef)),
    'finance_outbox_events.idempotency_key must have a DB unique index');
  console.log('07.5R isolated fixture:', cityName);
  const city = await City.create({ name: cityName, slug: cityName, is_active: true }); ids.city = city.id;
  const customer = await User.create({ name: '07.5R customer', phone: `r-c-${tag}`, password: 'not-a-login', role: 'customer', city_id: city.id }); ids.customer = customer.id;
  const owner = await User.create({ name: '07.5R owner', phone: `r-o-${tag}`, password: 'not-a-login', role: 'vendor', city_id: city.id }); ids.owner = owner.id;
  const riderUser = await User.create({ name: '07.5R rider', phone: `r-r-${tag}`, password: 'not-a-login', role: 'rider', city_id: city.id }); ids.riderUser = riderUser.id;
  const rider = await Rider.create({ user_id: riderUser.id, city_id: city.id, vehicle_type: 'motorbike', is_online: true, is_approved: true }); ids.rider = rider.id;
  const vendor = await Vendor.create({ owner_id: owner.id, city_id: city.id, name: cityName, category: 'food', phone: `r-v-${tag}`, address: 'Isolated fixture', is_active: false, is_open: false }); ids.vendor = vendor.id;
  const item = await MenuItem.create({ vendor_id: vendor.id, name: '07.5R item', price_usd: 4.25, weight_kg: 1, is_available: true }); ids.item = item.id;

  const baseline = await Rider.findByPk(ids.rider);
  const beforeEarnings = Number(baseline.total_earnings_usd || 0);
  const beforeDeliveries = Number(baseline.total_deliveries || 0);

  // Concurrent requests must serialize on the order row. A successful replay
  // must not enqueue events or credit earnings a second time.
  const id = await readyOrder();
  const attempts = await Promise.allSettled([
    updateOrderStatus(id, 'delivered', ids.riderUser, proof),
    updateOrderStatus(id, 'delivered', ids.riderUser, proof),
  ]);
  assert.equal(attempts.filter(a => a.status === 'fulfilled').length, 2,
    `Concurrent delivery requests failed: ${attempts.map(a => a.reason?.message || a.status).join('; ')}`);
  const delivered = await Order.findByPk(id);
  assert.equal(delivered.status, 'delivered');
  assert.equal(delivered.delivery_proof_url, proof);
  const events = await FinanceOutboxEvent.findAll({ where: { aggregate_type: 'order', aggregate_id: id } });
  assert.equal(events.filter(e => e.event_type === 'order.completed').length, 1);
  assert.equal(events.filter(e => e.event_type === 'delivery.completed').length, 1);
  assert.equal(events.length, 2, 'Unexpected finance events on completed order');
  assert.equal(await OrderEconomics.count({ where: { order_id: id } }), 1);
  const after = await Rider.findByPk(ids.rider);
  const expected = Number(delivered.delivery_fee_usd || 0) + Number(delivered.tip_usd || 0);
  assert.ok(Math.abs(Number(after.total_earnings_usd || 0) - beforeEarnings - expected) < 0.011,
    'Earnings credited more or less than once');
  assert.equal(Number(after.total_deliveries || 0), beforeDeliveries + 1);
  await updateOrderStatus(id, 'delivered', ids.riderUser, proof);
  assert.equal(await FinanceOutboxEvent.count({ where: { aggregate_type: 'order', aggregate_id: id } }), 2);
  assert.equal(Number((await Rider.findByPk(ids.rider)).total_deliveries), beforeDeliveries + 1);
  console.log('PASS: concurrent and replayed delivery yield one economics row, two unique finance events, one earnings credit');

  // Inject failure in the second outbox insert. Since the event writer is
  // invoked inside the same DB transaction, order/first event/earnings roll back.
  const rollbackId = await readyOrder();
  const savedCreate = FinanceOutboxEvent.create;
  let injected = false;
  try {
    FinanceOutboxEvent.create = async function(values, options) {
      if (values.event_type === 'delivery.completed') {
        injected = true;
        throw new Error('07.5R injected finance outbox failure');
      }
      return savedCreate.call(this, values, options);
    };
    await assert.rejects(
      () => updateOrderStatus(rollbackId, 'delivered', ids.riderUser, `${proof}-rollback`),
      /07\.5R injected finance outbox failure/,
    );
  } finally {
    FinanceOutboxEvent.create = savedCreate;
  }
  assert.ok(injected, 'Failure injection did not reach delivery outbox insert');
  const rolledBack = await Order.findByPk(rollbackId);
  assert.equal(rolledBack.status, 'en_route');
  assert.equal(rolledBack.delivered_at, null);
  assert.equal(rolledBack.delivery_proof_url, null);
  assert.equal(await FinanceOutboxEvent.count({ where: { aggregate_type: 'order', aggregate_id: rollbackId } }), 0);
  assert.equal(await OrderEconomics.count({ where: { order_id: rollbackId } }), 0);
  const riderAfterRollback = await Rider.findByPk(ids.rider);
  assert.equal(Number(riderAfterRollback.total_deliveries), beforeDeliveries + 1);
  assert.ok(Math.abs(Number(riderAfterRollback.total_earnings_usd) - Number(after.total_earnings_usd)) < 0.011);
  console.log('PASS: finance failure rolls back delivery, proof, outbox and earnings');
}

(async () => {
  let failed = false;
  try { await main(); } catch (err) { failed = true; console.error('FAIL:', err.stack || err.message); }
  try { await cleanup(); console.log('Fixture cleanup completed'); }
  catch (err) { failed = true; console.error('CLEANUP FAILED: inspect prefix', cityName, err.stack || err.message); }
  finally { await sequelize.close(); }
  if (failed) process.exitCode = 1;
})();
