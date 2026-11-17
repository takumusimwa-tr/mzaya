'use strict';
// Explicitly opt-in: this suite uses two real PostgreSQL connections and rolls back writes.
const test = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

if (process.env.CHECKOUT_CONCURRENCY_CONFIRM !== 'ISOLATED_DATABASE_ONLY') {
  throw new Error('Refusing database tests: set CHECKOUT_CONCURRENCY_CONFIRM=ISOLATED_DATABASE_ONLY');
}
const { sequelize } = require('../src/config/db');
const { Order, Rider } = require('../src/models/associations');

const rollback = async (tx) => {
  if (tx && !tx.finished) await tx.rollback();
};

// Each test is serialized: the suite intentionally holds concurrent connections.
test('07.5I: PostgreSQL checkout constraints are installed', async () => {
  const [indexes] = await sequelize.query(`SELECT indexdef FROM pg_indexes WHERE schemaname=current_schema() AND tablename='orders' AND indexname='orders_client_request_id_unique'`);
  assert.equal(indexes.length, 1, 'missing request ID unique index');
  assert.match(indexes[0].indexdef, /CREATE UNIQUE INDEX/i);
  assert.match(indexes[0].indexdef, /client_request_id/);
  const [checks] = await sequelize.query(`SELECT pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE conrelid='orders'::regclass AND conname='orders_request_fingerprint_shape'`);
  assert.equal(checks.length, 1, 'missing fingerprint CHECK constraint');
});

test('07.5I: real order insertion rolls back without persistence', async (t) => {
  const template = await Order.findOne({ order: [['createdAt', 'DESC']] });
  if (!template) return t.skip('No existing order fixture; cannot safely synthesize foreign keys');
  const id = randomUUID();
  const requestId = randomUUID();
  let tx;
  try {
    tx = await sequelize.transaction();
    const values = { ...template.get({ plain: true }), id, client_request_id: requestId, request_fingerprint: 'a'.repeat(64), createdAt: new Date(), updatedAt: new Date() };
    await Order.create(values, { transaction: tx });
    assert.ok(await Order.findByPk(id, { transaction: tx }));
  } finally { await rollback(tx); }
  assert.equal(await Order.findByPk(id), null, 'rollback leaked a test order');
});

test('07.5I: concurrent inserts with same request ID cannot both commit', async (t) => {
  const template = await Order.findOne({ order: [['createdAt', 'DESC']] });
  if (!template) return t.skip('No existing order fixture; concurrency insert not attempted');
  const requestId = randomUUID();
  const base = template.get({ plain: true });
  const mk = () => ({ ...base, id: randomUUID(), client_request_id: requestId, request_fingerprint: 'b'.repeat(64), createdAt: new Date(), updatedAt: new Date() });
  let first, second;
  try {
    first = await sequelize.transaction();
    second = await sequelize.transaction();
    await Order.create(mk(), { transaction: first });
    // Prevent indefinite waiting: the second insert must not silently bypass the unique index.
    await sequelize.query("SET LOCAL lock_timeout = '750ms'", { transaction: second });
    await assert.rejects(Order.create(mk(), { transaction: second }), (error) => {
      const code = error?.parent?.code || error?.original?.code;
      return code === '55P03' || code === '23505';
    }, 'second connection unexpectedly inserted duplicate request ID');
  } finally {
    // A lock timeout aborts the second PostgreSQL transaction; rollback both.
    await rollback(second);
    await rollback(first);
  }
  const count = await Order.count({ where: { client_request_id: requestId } });
  assert.equal(count, 0, 'concurrency test left persistent rows');
});

test('07.5I: locked Mzaya row is excluded by SKIP LOCKED', async (t) => {
  const rider = await Rider.findOne();
  if (!rider) return t.skip('No rider fixture; row-lock behavior not exercised');
  let first, second;
  try {
    first = await sequelize.transaction();
    second = await sequelize.transaction();
    const locked = await Rider.findAll({ where: { id: rider.id }, transaction: first, lock: first.LOCK.UPDATE });
    assert.equal(locked.length, 1);
    const skipped = await Rider.findAll({ where: { id: rider.id }, transaction: second, lock: second.LOCK.UPDATE, skipLocked: true });
    assert.equal(skipped.length, 0, 'concurrent transaction selected a locked Mzaya');
  } finally { await rollback(second); await rollback(first); }
});

test.after(async () => { await sequelize.close(); });
