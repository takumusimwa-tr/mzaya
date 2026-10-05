const {
  resetDatabase,
  closeDatabase,
} = require('./setup');
const {
  sequelize,
  models,
  seedFinance,
  drain,
} = require('./financeE2E.helpers');
const {
  enqueueFinanceOutboxEvent,
} = require('../src/services/financeOutbox.service');
const {
  deliverOutboxEvent,
} = require('../src/services/financeEventDelivery.service');

const {
  FinanceBusinessEvent,
  FinanceOutboxEvent,
  LedgerTransaction,
} = models;

beforeAll(async () => {
  await resetDatabase();
  await seedFinance();
});

afterAll(async () => {
  delete process.env.FINANCE_FAILURE_INJECTION;
  delete process.env.FINANCE_FAILURE_POINT;
  await closeDatabase();
});

test('crash after ingestion does not duplicate business event on retry', async () => {
  let outbox;

  await sequelize.transaction(async (transaction) => {
    outbox = await enqueueFinanceOutboxEvent({
      transaction,
      aggregateType: 'payment',
      aggregateId:
        '22222222-2222-4222-8222-222222222222',
      eventType: 'payment.captured',
      sourceSystem: 'payments',
      payload: {
        paymentId:
          '22222222-2222-4222-8222-222222222222',
        currency: 'USD',
        amountMinor: 700,
      },
      idempotencyKey: 'failure-injection:ingest',
    });
  });

  process.env.FINANCE_FAILURE_INJECTION = 'true';
  process.env.FINANCE_FAILURE_POINT =
    'after_outbox_ingest_before_publish';

  await expect(
    deliverOutboxEvent({
      outboxEventId: outbox.id,
      workerId: 'failure-test',
    })
  ).rejects.toMatchObject({
    code: 'FINANCE_FAILURE_INJECTED',
  });

  expect(
    await FinanceBusinessEvent.count({
      where: {
        idempotency_key: 'failure-injection:ingest',
      },
    })
  ).toBe(1);

  delete process.env.FINANCE_FAILURE_INJECTION;
  delete process.env.FINANCE_FAILURE_POINT;

  const stale = await FinanceOutboxEvent.findByPk(outbox.id);
  await stale.update({
    status: 'retry',
    available_at: new Date(),
  });

  await drain();

  expect(
    await FinanceBusinessEvent.count({
      where: {
        idempotency_key: 'failure-injection:ingest',
      },
    })
  ).toBe(1);

  expect(await LedgerTransaction.count()).toBe(1);
});
