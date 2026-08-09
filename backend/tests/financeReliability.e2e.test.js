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
  deliverOutboxEvent,
} = require('../src/services/financeEventDelivery.service');
const {
  quarantineOutboxEvent,
} = require('../src/services/financeDeadLetter.service');
const {
  requestDeadLetterReplay,
} = require('../src/services/financeDeadLetter.service');

const {
  FinanceOutboxEvent,
  FinanceDeadLetter,
} = models;

beforeAll(async () => {
  await resetDatabase();
  await seedFinance();
});

afterAll(async () => {
  await closeDatabase();
});

test('poison event can be quarantined and explicitly returned to retry', async () => {
  let outbox;

  await sequelize.transaction(async (transaction) => {
    outbox = await enqueueFinanceOutboxEvent({
      transaction,
      aggregateType: 'test',
      eventType: 'unknown.event',
      sourceSystem: 'test',
      payload: {
        currency: 'USD',
        amountMinor: 100,
      },
      idempotencyKey: 'test:poison:1',
    });
  });

  // Delivery only ingests; posting failure happens later. Quarantine explicitly
  // to validate the controlled replay lifecycle.
  await deliverOutboxEvent({
    outboxEventId: outbox.id,
    workerId: 'test-worker',
  });

  const deadLetter = await quarantineOutboxEvent({
    outboxEventId: outbox.id,
    reasonCode: 'TEST_POISON_EVENT',
    reason: 'Intentional E2E quarantine',
  });

  expect(deadLetter.status).toBe('quarantined');

  await requestDeadLetterReplay({
    deadLetterId: deadLetter.id,
    requestedBy: null,
  });

  const refreshed = await FinanceOutboxEvent.findByPk(outbox.id);
  const refreshedDeadLetter = await FinanceDeadLetter.findByPk(deadLetter.id);

  expect(refreshed.status).toBe('retry');
  expect(refreshedDeadLetter.status).toBe('replay_requested');
});
