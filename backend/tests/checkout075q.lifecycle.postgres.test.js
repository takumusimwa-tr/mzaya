'use strict';
// Real createOrder() competing dispatch transactions. Isolated local DB only.
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { sequelize } = require('../src/config/db');
const { City, User, Rider, Vendor, MenuItem, Order, OrderFood } = require('../src/models/associations');
const { createOrder } = require('../src/services/order.service');
const { cancelOrder, updateOrderStatus } = require('../src/services/order.service');

const tag = randomUUID().replace(/-/g, '').slice(0, 20);
const ids = { city: null, customer: null, owner: null, riderUser: null, rider: null, vendor: null, item: null };
const orderIds = new Set();
const cityName = `lifecycle-q-${tag}`;

async function cleanup() {
  // Explicitly scope all deletes to UUIDs created by this run.
  const owned = [...orderIds];
  if (ids.customer) {
    const extra = await Order.findAll({ where: { customer_id: ids.customer }, attributes: ['id'], raw: true });
    for (const o of extra) owned.push(o.id);
  }
  const unique = [...new Set(owned)];
  if (unique.length) await sequelize.transaction(async transaction => {
    await OrderFood.destroy({ where: { order_id: unique }, transaction });
    await Order.destroy({ where: { id: unique, customer_id: ids.customer }, transaction });
  });
  if (ids.item) await MenuItem.destroy({ where: { id: ids.item } });
  if (ids.vendor) await Vendor.destroy({ where: { id: ids.vendor } });
  if (ids.rider) await Rider.destroy({ where: { id: ids.rider } });
  if (ids.riderUser) await User.destroy({ where: { id: ids.riderUser } });
  if (ids.owner) await User.destroy({ where: { id: ids.owner } });
  if (ids.customer) await User.destroy({ where: { id: ids.customer } });
  if (ids.city) await City.destroy({ where: { id: ids.city } });
}
function payload(vendor, item) {
  return {
    client_request_id: randomUUID(), category_type: 'food', city: cityName,
    pickup_address: '07.5Q isolated pickup', dropoff_address: '07.5Q isolated dropoff',
    payment_method: 'ecocash', tip_usd: 0,
    detail: { restaurant_id: vendor.id, restaurant_name: vendor.name,
      items: [{ menu_item_id: item.id, qty: 1, unit_price_usd: 0.01 }] },
  };
}
async function main() {
  assert.equal(process.env.CHECKOUT_LIFECYCLE_CONFIRM, 'DISPOSABLE_LOCAL_DATABASE_ONLY');
  assert.ok(process.env.DB_URL, 'DB_URL required');
  const url = new URL(process.env.DB_URL);
  assert.ok(['localhost', '127.0.0.1', '::1', '[::1]'].includes(url.hostname), 'Remote database refused');
  assert.equal(url.pathname, '/mzaya', 'Only isolated local mzaya DB permitted');
  const [[db]] = await sequelize.query('SELECT current_database() AS name');
  assert.equal(db.name, 'mzaya');
  console.log('07.5Q isolated fixture:', cityName);
  const city = await City.create({ name: cityName, slug: cityName, is_active: true }); ids.city = city.id;
  const customer = await User.create({ name: '07.5Q customer', phone: `k-c-${tag}`, password: 'not-a-login', role: 'customer', city_id: city.id }); ids.customer = customer.id;
  const owner = await User.create({ name: '07.5Q owner', phone: `k-o-${tag}`, password: 'not-a-login', role: 'vendor', city_id: city.id }); ids.owner = owner.id;
  const riderUser = await User.create({ name: '07.5Q rider', phone: `k-r-${tag}`, password: 'not-a-login', role: 'rider', city_id: city.id }); ids.riderUser = riderUser.id;
  const rider = await Rider.create({ user_id: riderUser.id, city_id: city.id, vehicle_type: 'motorbike', is_online: true, is_approved: true }); ids.rider = rider.id;
  const vendor = await Vendor.create({ owner_id: owner.id, city_id: city.id, name: cityName, category: 'food', phone: `k-v-${tag}`, address: 'Isolated fixture', is_active: false, is_open: false }); ids.vendor = vendor.id;
  const item = await MenuItem.create({ vendor_id: vendor.id, name: '07.5Q item', price_usd: 4.25, weight_kg: 1, is_available: true }); ids.item = item.id;


  // Scenario A: cancellation and pickup compete for the same locked order.
  // A negotiable order is pending; assign fixture Mzaya via direct test setup.
  const first = await createOrder(customer.id, { ...payload(vendor, item), is_negotiable: true });
  orderIds.add(first.order.id);
  await Order.update({ status: 'accepted', rider_id: riderUser.id }, { where: { id: first.order.id } });
  const race = await Promise.allSettled([
    cancelOrder(first.order.id, customer.id, '07.5Q test cancellation'),
    updateOrderStatus(first.order.id, 'picked_up', riderUser.id),
  ]);
  const latest = await Order.findByPk(first.order.id);
  assert.ok(['cancelled', 'picked_up'].includes(latest.status));
  assert.equal(race.filter(x => x.status === 'fulfilled').length, 1,
    'Exactly one of cancellation or pickup must succeed');
  console.log('PASS: cancellation versus pickup has one winning transition');

  // Scenario B: invalid transitions and unauthorized status edits are rejected.
  const second = await createOrder(customer.id, { ...payload(vendor, item), is_negotiable: true });
  orderIds.add(second.order.id);
  await Order.update({ status: 'accepted', rider_id: riderUser.id }, { where: { id: second.order.id } });
  await assert.rejects(() => updateOrderStatus(second.order.id, 'delivered', riderUser.id, 'proof://invalid'),
    /Invalid order status transition/);
  await assert.rejects(() => updateOrderStatus(second.order.id, 'picked_up', customer.id),
    /Access denied/);
  assert.equal((await Order.findByPk(second.order.id)).status, 'accepted');
  console.log('PASS: invalid transition and unauthorized edit leave order unchanged');

  // Scenario C: cancellation cannot be repeated, and cannot follow pickup.
  await updateOrderStatus(second.order.id, 'picked_up', riderUser.id);
  await assert.rejects(() => cancelOrder(second.order.id, customer.id, 'too late'),
    /cannot be cancelled/i);
  assert.equal((await Order.findByPk(second.order.id)).status, 'picked_up');
  console.log('PASS: cancellation after pickup is rejected');

  // Scenario D: duplicate delivery / earnings is deliberately separate because
  // finance-event tables may need additional migrations and fixture cleanup.
  console.log('NOT RUN: duplicate delivery/finance/earnings requires finance fixture coverage');

}
(async () => {
  let failed = false;
  try { await main(); } catch (e) { failed = true; console.error('FAIL:', e.stack || e.message); }
  try { await cleanup(); console.log('Fixture cleanup completed'); }
  catch (e) { failed = true; console.error('CLEANUP FAILED: inspect prefix', cityName, e.stack || e.message); }
  finally { await sequelize.close(); }
  if (failed) process.exitCode = 1;
})();
