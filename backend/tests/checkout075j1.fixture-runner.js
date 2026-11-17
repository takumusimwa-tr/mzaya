'use strict';
// Run only against a disposable local development database.
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { sequelize } = require('../src/config/db');
const { City, User, Vendor, MenuItem, Order, OrderFood } = require('../src/models/associations');

const ids = { city: null, customer: null, owner: null, vendor: null, item: null };
const runId = randomUUID().replace(/-/g, '');
const name = `checkout-j1-${runId.slice(0, 16)}`;

async function cleanup() {
  // Only delete records connected to this run's generated UUIDs.
  // Order detail FK cleanup comes before orders; no unrelated records are selected.
  if (ids.vendor) {
    const details = await OrderFood.findAll({ where: { restaurant_id: ids.vendor }, attributes: ['order_id'], raw: true });
    const orderIds = details.map((x) => x.order_id);
    if (orderIds.length) {
      await sequelize.transaction(async (transaction) => {
        await OrderFood.destroy({ where: { order_id: orderIds }, transaction });
        await Order.destroy({ where: { id: orderIds, customer_id: ids.customer }, transaction });
      });
    }
  }
  if (ids.item) await MenuItem.destroy({ where: { id: ids.item } });
  if (ids.vendor) await Vendor.destroy({ where: { id: ids.vendor } });
  if (ids.owner) await User.destroy({ where: { id: ids.owner } });
  if (ids.customer) await User.destroy({ where: { id: ids.customer } });
  if (ids.city) await City.destroy({ where: { id: ids.city } });
}

async function main() {
  assert.equal(process.env.CHECKOUT_FIXTURE_CONFIRM, 'DISPOSABLE_LOCAL_DATABASE_ONLY', 'Explicit fixture confirmation required');
  assert.equal(process.env.CHECKOUT_SERVICE_CONFIRM, 'ISOLATED_DATABASE_ONLY', 'Service test confirmation required');
  const url = new URL(process.env.DB_URL);
  assert.ok(['localhost', '127.0.0.1', '::1', '[::1]'].includes(url.hostname), 'Refusing remote database');
  assert.equal(url.pathname, '/mzaya', 'Refusing database other than mzaya');
  const [[db]] = await sequelize.query('SELECT current_database() AS name, inet_server_addr()::text AS address');
  assert.equal(db.name, 'mzaya');
  console.log('Fixture database:', db.name, 'host:', url.hostname);
  const city = await City.create({ name, slug: name, is_active: true }); ids.city = city.id;
  const customer = await User.create({ name: '07.5J1 test customer', phone: `j1-c-${runId}`, password: 'not-a-login', role: 'customer', city_id: city.id }); ids.customer = customer.id;
  const owner = await User.create({ name: '07.5J1 test owner', phone: `j1-v-${runId}`, password: 'not-a-login', role: 'vendor', city_id: city.id }); ids.owner = owner.id;
  const vendor = await Vendor.create({ owner_id: owner.id, city_id: city.id, name, category: 'food', phone: `j1-shop-${runId}`, address: 'Fixture-only address', is_active: false, is_open: false }); ids.vendor = vendor.id;
  const item = await MenuItem.create({ vendor_id: vendor.id, name: '07.5J1 test item', price_usd: 7.25, weight_kg: 1, is_available: true }); ids.item = item.id;
  const child = spawnSync(process.execPath, ['--test', path.resolve(__dirname, 'checkout075j.service.postgres.test.js')], {
    stdio: 'inherit',
    env: { ...process.env, CHECKOUT_FIXTURE_CUSTOMER_ID: ids.customer, CHECKOUT_FIXTURE_VENDOR_ID: ids.vendor, CHECKOUT_FIXTURE_ITEM_ID: ids.item },
    timeout: 90000,
  });
  if (child.error) throw child.error;
  if (child.status !== 0) throw new Error(`Service test failed with exit ${child.status}`);
  console.log('PASS: fixture-backed service test completed');
}

(async () => {
  let failed = false;
  try { await main(); } catch (err) { failed = true; console.error('FAIL:', err.stack || err.message); }
  try { await cleanup(); console.log('Fixture cleanup completed'); }
  catch (err) { failed = true; console.error('CLEANUP FAILED: manually inspect fixture prefix', name, err.stack || err.message); }
  finally { await sequelize.close(); }
  if (failed) process.exitCode = 1;
})();
