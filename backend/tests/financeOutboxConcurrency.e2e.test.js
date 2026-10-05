const {
  resetDatabase,
  closeDatabase,
} = require('./setup');
const {
  sequelize,
  models,
  seedFinance,
} = require('./financeE2E.helpers');
const {
  enqueueFinanceOutboxEvent,
} = require('../src/services/financeOutbox.service');
const {
  claimOutboxBatch,
} = require('../src/services/financeOutboxClaim.service');

const {
  FinanceOutboxEvent,
} = models;

beforeAll(async () => {
  await resetDatabase();
  await seedFinance();
});

afterAll(async () => {
  await closeDatabase();
});

test('concurrent workers do not claim the same outbox event', async () => {
  for (let i = 0; i < 10; i += 1) {
    await sequelize.transaction(async (transaction) => {
      await enqueueFinanceOutboxEvent({
        transaction,
        aggregateType: 'test',
        aggregateId: null,
        eventType: 'payment.captured',
        sourceSystem: 'test',
        payload: {
          paymentId:
            `11111111-1111-4111-8111-${String(i).padStart(12, '0')}`,
          currency: 'USD',
          amountMinor: 100 + i,
        },
        idempotencyKey: `concurrency:${i}`,
      });
    });
  }

  const [a, b] = await Promise.all([
    claimOutboxBatch({
      workerId: 'worker-a',
      limit: 5,
    }),
    claimOutboxBatch({
      workerId: 'worker-b',
      limit: 5,
    }),
  ]);

  const idsA = new Set(a.map((row) => row.id));
  const idsB = new Set(b.map((row) => row.id));

  for (const id of idsA) {
    expect(idsB.has(id)).toBe(false);
  }

  expect(idsA.size + idsB.size).toBe(10);

  expect(
    await FinanceOutboxEvent.count({
      where: { status: 'processing' },
    })
  ).toBe(10);
});
