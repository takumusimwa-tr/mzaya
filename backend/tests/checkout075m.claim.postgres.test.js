'use strict';
// Real createOrder() competing dispatch transactions. Isolated local DB only.
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { sequelize } = require('../src/config/db');
const { City, User, Rider, Vendor, MenuItem, Order, OrderFood } = require('../src/models/associations');
const { createOrder } = require('../src/services/order.service');
const { claimOrderForRider } = require('../src/services/orderClaim.service');

const tag = randomUUID().replace(/-/g, '').slice(0, 20);
const ids = { city: null, customer: null, owner: null, riderUser: null, rider: null, vendor: null, item: null };
const orderIds = new Set();
const cityName = `claim-m-${tag}`;

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
    pickup_address: '07.5K isolated pickup', dropoff_address: '07.5K isolated dropoff',
    payment_method: 'ecocash', tip_usd: 0,
    detail: { restaurant_id: vendor.id, restaurant_name: vendor.name,
      items: [{ menu_item_id: item.id, qty: 1, unit_price_usd: 0.01 }] },
  };
}
async function main() {
  assert.equal(process.env.CHECKOUT_CLAIM_CONFIRM, 'DISPOSABLE_LOCAL_DATABASE_ONLY');
  assert.ok(process.env.DB_URL, 'DB_URL required');
  const url = new URL(process.env.DB_URL);
  assert.ok(['localhost', '127.0.0.1', '::1', '[::1]'].includes(url.hostname), 'Remote database refused');
  assert.equal(url.pathname, '/mzaya', 'Only isolated local mzaya DB permitted');
  const [[db]] = await sequelize.query('SELECT current_database() AS name');
  assert.equal(db.name, 'mzaya');
  console.log('07.5K isolated fixture:', cityName);
  const city = await City.create({ name: cityName, slug: cityName, is_active: true }); ids.city = city.id;
  const customer = await User.create({ name: '07.5K customer', phone: `k-c-${tag}`, password: 'not-a-login', role: 'customer', city_id: city.id }); ids.customer = customer.id;
  const owner = await User.create({ name: '07.5K owner', phone: `k-o-${tag}`, password: 'not-a-login', role: 'vendor', city_id: city.id }); ids.owner = owner.id;
  const riderUser = await User.create({ name: '07.5K rider', phone: `k-r-${tag}`, password: 'not-a-login', role: 'rider', city_id: city.id }); ids.riderUser = riderUser.id;
  const rider = await Rider.create({ user_id: riderUser.id, city_id: city.id, vehicle_type: 'motorbike', is_online: true, is_approved: true }); ids.rider = rider.id;
  const vendor = await Vendor.create({ owner_id: owner.id, city_id: city.id, name: cityName, category: 'food', phone: `k-v-${tag}`, address: 'Isolated fixture', is_active: false, is_open: false }); ids.vendor = vendor.id;
  const item = await MenuItem.create({ vendor_id: vendor.id, name: '07.5K item', price_usd: 4.25, weight_kg: 1, is_available: true }); ids.item = item.id;


  // Scenario A: two simultaneous manual claims on separate pending orders.
  // Negotiable checkout defers automatic dispatch.
  const deferred = () => ({ ...payload(vendor, item), is_negotiable: true });
  const a = await createOrder(customer.id, deferred());
  const b = await createOrder(customer.id, deferred());
  orderIds.add(a.order.id); orderIds.add(b.order.id);
  const manual = await Promise.allSettled([
    claimOrderForRider(a.order.id, riderUser.id),
    claimOrderForRider(b.order.id, riderUser.id),
  ]);
  assert.equal(manual.filter(x => x.status === 'fulfilled').length, 1,
    'Exactly one manual claim must succeed');
  assert.equal(manual.filter(x => x.status === 'rejected' && x.reason?.status === 409).length, 1,
    'Competing claim must return 409 busy/conflict');
  const pair = await Order.findAll({ where: { id: [a.order.id, b.order.id] } });
  assert.equal(pair.filter(o => o.rider_id === riderUser.id && o.status === 'accepted').length, 1);
  assert.equal(pair.filter(o => o.rider_id === null && o.status === 'pending').length, 1);
  console.log('PASS: concurrent manual claims assign only one order');

  // Free the fixture rider by marking its claimed order delivered.
  // This is a test-only state transition, never used for production operations.
  const assigned = pair.find(o => o.rider_id === riderUser.id);
  await assigned.update({ status: 'delivered' });

  // Scenario B: a manual claim and a real checkout auto-dispatch compete for
  // the same Mzaya. Both use the rider row lock.
  const pending = pair.find(o => o.rider_id === null);
  const mixed = await Promise.allSettled([
    claimOrderForRider(pending.id, riderUser.id),
    createOrder(customer.id, payload(vendor, item)),
  ]);
  for (const outcome of mixed) {
    if (outcome.status === 'fulfilled' && outcome.value?.order?.id) {
      orderIds.add(outcome.value.order.id);
    }
  }
  const rejected = mixed.filter(x => x.status === 'rejected');
  assert.equal(rejected.length, 0,
    `Mixed operations should complete: ${rejected.map(x=>x.reason?.stack).join('\\n')}`);
  const finalOrders = await Order.findAll({ where: { customer_id: customer.id } });
  const active = finalOrders.filter(o =>
    o.rider_id === riderUser.id && ['accepted', 'picked_up', 'en_route'].includes(o.status));
  assert.equal(active.length, 1, 'Manual claim and automatic dispatch must not double-assign rider');
  console.log('PASS: manual claim versus auto-dispatch does not double-assign Mzaya');

}
(async () => {
  let failed = false;
  try { await main(); } catch (e) { failed = true; console.error('FAIL:', e.stack || e.message); }
  try { await cleanup(); console.log('Fixture cleanup completed'); }
  catch (e) { failed = true; console.error('CLEANUP FAILED: inspect prefix', cityName, e.stack || e.message); }
  finally { await sequelize.close(); }
  if (failed) process.exitCode = 1;
})();
