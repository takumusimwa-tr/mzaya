const {
  resetDatabase,
  closeDatabase,
} = require('./setup');
const {
  sequelize,
  seedFinance,
} = require('./financeE2E.helpers');
const {
  enqueueFinanceOutboxEvent,
} = require('../src/services/financeOutbox.service');
const {
  getFinanceRuntimeHealth,
} = require('../src/services/financeObservability.service');

beforeAll(async () => {
  await resetDatabase();
  await seedFinance();
});

afterAll(async () => {
  await closeDatabase();
});

test('finance health reports a pending outbox item without mutating it', async () => {
  await sequelize.transaction(async (transaction) => {
    await enqueueFinanceOutboxEvent({
      transaction,
      aggregateType: 'observability_test',
      eventType: 'payment.captured',
      sourceSystem: 'test',
      payload: {
        paymentId: '33333333-3333-4333-8333-333333333333',
        currency: 'USD',
        amountMinor: 100,
      },
      idempotencyKey: 'observability:pending-outbox',
    });
  });

  const health = await getFinanceRuntimeHealth();

  expect(health.pipeline.pendingOutbox).toBe(1);
  expect(health.indicators.outboxBacklog.value).toBe(1);
  expect(['healthy', 'warning', 'critical']).toContain(health.status);
});
