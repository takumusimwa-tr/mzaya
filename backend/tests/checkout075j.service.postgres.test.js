'use strict';
// Isolated-development-database only. Creates orders with unique request IDs,
// deletes only its own rows in finally. Does not alter catalog, promos or riders.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { sequelize } = require('../src/config/db');
const { Order, OrderFood, MenuItem, Vendor, User } = require('../src/models/associations');
const { createOrder } = require('../src/services/order.service');

const guard = process.env.CHECKOUT_SERVICE_CONFIRM === 'ISOLATED_DATABASE_ONLY';
const owned = new Set();
const itemFixture = async () => {
  const item = process.env.CHECKOUT_FIXTURE_ITEM_ID
    ? await MenuItem.findByPk(process.env.CHECKOUT_FIXTURE_ITEM_ID)
    : await MenuItem.findOne({ where: { is_available: true }, order: [['createdAt', 'ASC']] });
  if (!item) return null;
  const vendor = await Vendor.findByPk(item.vendor_id);
  if (!vendor) return null;
  const customer = process.env.CHECKOUT_FIXTURE_CUSTOMER_ID
    ? await User.findByPk(process.env.CHECKOUT_FIXTURE_CUSTOMER_ID)
    : await User.findOne({ where: { role: 'customer' } });
  if (!customer) return null;
  return { item, vendor, customer };
};
function payload(f, key, overrides = {}) {
  return {
    client_request_id: key,
    category_type: 'food',
    city: 'harare',
    pickup_address: '07.5J integration test pickup',
    dropoff_address: '07.5J integration test dropoff',
    payment_method: 'ecocash',
    tip_usd: 0,
    // Defers dispatch: this test must not allocate a real Mzaya.
    is_negotiable: true,
    offered_fare_usd: 5,
    detail: {
      restaurant_id: f.vendor.id,
      restaurant_name: f.vendor.name || '07.5J vendor',
      items: [{ menu_item_id: f.item.id, qty: 1, unit_price_usd: 0.01, name: 'client-supplied-untrusted-name' }],
    },
    ...overrides,
  };
}
async function cleanup() {
  if (!owned.size) return;
  const ids = [...owned];
  await sequelize.transaction(async (transaction) => {
    await OrderFood.destroy({ where: { order_id: ids }, transaction });
    await Order.destroy({ where: { id: ids }, transaction });
  });
}

test('07.5J: real createOrder checkout contract (isolated DB only)', { timeout: 60000 }, async (t) => {
  if (!guard) { t.skip('Set CHECKOUT_SERVICE_CONFIRM=ISOLATED_DATABASE_ONLY'); return; }
  let dbName;
  try {
    const [rows] = await sequelize.query('SELECT current_database() AS name, current_user AS username');
    dbName = rows[0].name;
    assert.equal(dbName, 'mzaya', 'Refusing to write outside the expected isolated mzaya database');
    const f = await itemFixture();
    if (!f) {
      if (process.env.CHECKOUT_FIXTURE_ITEM_ID) throw new Error('Fixture records missing');
      t.skip('Requires an existing customer, vendor and available catalog item'); return;
    }
    if (process.env.CHECKOUT_FIXTURE_VENDOR_ID) assert.equal(f.vendor.id, process.env.CHECKOUT_FIXTURE_VENDOR_ID);
    // In this category the existing service currently allows negotiable=true;
    // using it prevents dispatch while preserving the complete placement path.
    const key = randomUUID();
    const p = payload(f, key);
    const first = await createOrder(f.customer.id, p);
    owned.add(first.order.id);
    assert.equal(first.replayed, undefined);
    assert.equal(first.order.client_request_id, key);
    assert.equal(Number(first.order.subtotal_usd), Number(f.item.price_usd), 'server catalog price must win');
    const detail = await OrderFood.findOne({ where: { order_id: first.order.id } });
    assert.ok(detail, 'food detail must be persisted');
    assert.equal(Number(detail.items[0].unit_price_usd), Number(f.item.price_usd));
    assert.equal(detail.items[0].name, f.item.name);
    const replay = await createOrder(f.customer.id, p);
    assert.equal(replay.replayed, true);
    assert.equal(replay.order.id, first.order.id);
    await assert.rejects(
      () => createOrder(f.customer.id, payload(f, key, { dropoff_address: 'Different 07.5J destination' })),
      (err) => err.status === 409,
    );
    const count = await Order.count({ where: { client_request_id: key } });
    assert.equal(count, 1);
    await t.test('concurrent same-key calls resolve to one persisted order', async () => {
      const concurrentKey = randomUUID();
      const request = payload(f, concurrentKey);
      const results = await Promise.allSettled([createOrder(f.customer.id, request), createOrder(f.customer.id, request)]);
      for (const result of results) if (result.status === 'fulfilled') owned.add(result.value.order.id);
      assert.equal(results.filter((r) => r.status === 'rejected').length, 0,
        'both identical concurrent requests should succeed (one creation, one replay)');
      assert.equal(new Set(results.map((r) => r.value.order.id)).size, 1);
      assert.equal(await Order.count({ where: { client_request_id: concurrentKey } }), 1);
    });
  } finally {
    try { await cleanup(); } finally { await sequelize.close(); }
  }
});
