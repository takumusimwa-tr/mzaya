'use strict';
// Isolated contract tests: mocked persistence; NO database connection or writes.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { randomUUID } = require('node:crypto');

const root = path.resolve(__dirname, '../..');
function load(relative, dependencies) {
  const filename = path.join(root, relative);
  const module = { exports: {} };
  const sandbox = {
    module, exports: module.exports, console, setImmediate: () => {},
    require(name) {
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      if (name.startsWith('node:')) return require(name);
      throw new Error(`Unmocked dependency: ${name}`);
    },
  };
  vm.runInNewContext(fs.readFileSync(filename, 'utf8'), sandbox, { filename });
  return module.exports;
}
function fixture() {
  const customer = randomUUID();
  const request = randomUUID();
  const rows = new Map();
  const details = new Map();
  let failDetail = false;
  let writes = 0;
  let dispatches = 0;
  let rollbackCount = 0;
  const Order = {
    async findOne({ where }) {
      const row = rows.get(where.client_request_id);
      return row && row.customer_id === where.customer_id ? row : null;
    },
    async create(data, { transaction }) {
      assert.ok(transaction);
      if (data.client_request_id && rows.has(data.client_request_id)) {
        const err = new Error('duplicate'); err.name = 'SequelizeUniqueConstraintError'; throw err;
      }
      const row = { ...data, id: randomUUID(), delivery_fee_usd: 0, total_usd: 0,
        async update(values, { transaction: tx }) { assert.ok(tx); Object.assign(this, values); },
        toJSON() { return { ...this }; },
      };
      transaction.staged.push(row);
      writes++;
      return row;
    },
  };
  const sequelize = {
    async transaction(fn) {
      const transaction = { staged: [], detail: [], LOCK: { UPDATE: 'UPDATE' } };
      try {
        const result = await fn(transaction);
        for (const row of transaction.staged) rows.set(row.client_request_id, row);
        for (const id of transaction.detail) details.set(id, true);
        return result;
      } catch (error) { rollbackCount++; throw error; }
    },
  };
  const detailModel = { async create(data, { transaction }) {
    assert.ok(transaction);
    if (failDetail) throw new Error('injected detail failure');
    transaction.detail.push(data.order_id);
    return data;
  } };
  const CATEGORY_TYPE = { FOOD: 'food', GROCERY: 'grocery', MATERIALS: 'materials', ERRAND: 'errand' };
  const ORDER_STATUS = { PENDING: 'pending', SCHEDULED: 'scheduled' };
  const deps = {
    '../config/constants': { CATEGORY_TYPE, ORDER_STATUS, VEHICLE_META: {} },
    '../models/associations': { Order, OrderFood: detailModel, OrderGrocery: detailModel,
      OrderMaterials: detailModel, OrderErrand: detailModel, Promo: {}, MenuItem: {} },
    './orderDispatch.service': {
      async dispatchOrder({ order, transaction }) {
        dispatches++;
        await order.update({ total_usd: 5, delivery_fee_usd: 5 }, { transaction });
        return { dispatched: false };
      }, assignVehicleType: () => 'bicycle', calculateDistanceKm: () => 5,
    },
    '../utils/feeCalculator': { calculateFees: () => ({ subtotal_usd: 0, delivery_fee_usd: 5, total_usd: 5 }), convertToZig: () => 0 },
    '../utils/promoEval': { evaluatePromo: () => ({ valid: false }) },
    './currency.service': { getCurrentRate: () => null },
    './ml.service': { extractFeatures: async () => {}, scoreOrder: async () => {} },
    '../realtime/orderPublisher': { publishOrderCreated() {}, publishOrderStatusChanged() {}, publishOrderAssigned() {} },
    '../utils/logger': { logger: { error() {} } },
    '../config/db': { sequelize },
    './orderFinanceEvents.service': { emitOrderCompleted() {}, emitOrderCancelled() {} },
    './deliveryFinanceEvents.service': { emitDeliveryCompleted() {} },
    './orderEconomicsIntegration.service': { upsertOrderEconomics() {} },
  };
  const service = load('backend/src/services/order.service.js', deps);
  const payload = { client_request_id: request, category_type: 'errand', city: 'harare',
    pickup_address: 'Shop', dropoff_address: 'Home', payment_method: 'ecocash',
    detail: { task_description: 'Collect parcel' } };
  return { service, customer, payload, rows, details,
    failDetail(value) { failDetail = value; },
    stats() { return { writes, dispatches, rollbackCount }; } };
}

test('same request ID and same payload returns one persisted order', async () => {
  const f = fixture();
  const first = await f.service.createOrder(f.customer, f.payload);
  const second = await f.service.createOrder(f.customer, { ...f.payload });
  assert.equal(first.replayed, undefined);
  assert.equal(second.replayed, true);
  assert.equal(first.order.id, second.order.id);
  assert.equal(f.rows.size, 1);
  assert.equal(f.details.size, 1);
  assert.equal(f.stats().dispatches, 1);
});

test('changed checkout with reused request ID rejects with 409', async () => {
  const f = fixture();
  await f.service.createOrder(f.customer, f.payload);
  await assert.rejects(f.service.createOrder(f.customer, { ...f.payload, dropoff_address: 'Other address' }),
    (err) => err.status === 409);
  assert.equal(f.rows.size, 1);
});

test('failed detail insertion rolls back parent order and permits retry', async () => {
  const f = fixture();
  f.failDetail(true);
  await assert.rejects(f.service.createOrder(f.customer, f.payload), /injected detail failure/);
  assert.equal(f.rows.size, 0);
  assert.equal(f.details.size, 0);
  assert.equal(f.stats().rollbackCount, 1);
  f.failDetail(false);
  await f.service.createOrder(f.customer, f.payload);
  assert.equal(f.rows.size, 1);
});

test('placeOrder translates service 409 into HTTP 409', async () => {
  const error = Object.assign(new Error('request conflict'), { status: 409 });
  const controller = load('backend/src/controllers/order.controller.js', {
    '../services/order.service': { createOrder: async () => { throw error; } },
    '../config/constants': { VEHICLE_RANK: { bicycle: 1 } },
    '../utils/logger': { logger: { error() {} } },
    '../realtime/orderPublisher': { publishOrderStatusChanged() {} },
  });
  let status;
  const response = { status(value) { status = value; return this; }, json(value) { return value; } };
  const body = await controller.placeOrder({ user: { id: randomUUID() }, body: {} }, response);
  assert.equal(status, 409);
  assert.equal(body.error, 'request conflict');
});

test('placeOrder returns 201 on creation and 200 on replay', async () => {
  let replayed = false;
  const controller = load('backend/src/controllers/order.controller.js', {
    '../services/order.service': { createOrder: async () => ({ order: { id: 'test' }, replayed }) },
    '../config/constants': { VEHICLE_RANK: { bicycle: 1 } },
    '../utils/logger': { logger: { error() {} } },
    '../realtime/orderPublisher': { publishOrderStatusChanged() {} },
  });
  let status;
  const res = { status(value) { status = value; return this; }, json(value) { return value; } };
  await controller.placeOrder({ user: { id: 'customer' }, body: {} }, res);
  assert.equal(status, 201);
  replayed = true;
  await controller.placeOrder({ user: { id: 'customer' }, body: {} }, res);
  assert.equal(status, 200);
});
