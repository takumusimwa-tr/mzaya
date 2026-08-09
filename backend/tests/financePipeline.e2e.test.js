const {
  resetDatabase,
  closeDatabase,
} = require('./setup');
const {
  sequelize,
  models,
  seedFinance,
  drain,
  financeLineageForIdempotency,
} = require('./financeE2E.helpers');
const {
  enqueueFinanceOutboxEvent,
} = require('../src/services/financeOutbox.service');

const {
  PaymentAccount,
  FinanceOutboxEvent,
  FinanceBusinessEvent,
  FinanceAccountingEvent,
  LedgerTransaction,
} = models;

beforeAll(async () => {
  await resetDatabase();
  await seedFinance();
});

afterAll(async () => {
  await closeDatabase();
});

test('payment capture flows outbox -> business event -> accounting event -> ledger', async () => {
  const paymentId = '11111111-1111-4111-8111-111111111111';

  await sequelize.transaction(async (transaction) => {
    await enqueueFinanceOutboxEvent({
      transaction,
      aggregateType: 'payment',
      aggregateId: paymentId,
      eventType: 'payment.captured',
      sourceSystem: 'payments',
      payload: {
        paymentId,
        currency: 'USD',
        amountMinor: 1250,
      },
      idempotencyKey: `payment:${paymentId}:captured:v1`,
    });
  });

  const summary = await drain();

  expect(summary.delivered).toBeGreaterThanOrEqual(1);
  expect(summary.processed).toBeGreaterThanOrEqual(1);
  expect(summary.posted).toBeGreaterThanOrEqual(1);

  const lineage = await financeLineageForIdempotency(
    `payment:${paymentId}:captured:v1`
  );

  expect(lineage.outbox.status).toBe('published');
  expect(lineage.businessEvent.status).toBe('posted');
  expect(lineage.accountingEvent.status).toBe('posted');
  expect(lineage.accountingEvent.debit_total_minor).toBe('1250');
  expect(lineage.accountingEvent.credit_total_minor).toBe('1250');
  expect(lineage.ledgerTransaction).toBeTruthy();
  expect(lineage.ledgerTransaction.entries).toHaveLength(2);

  const accounts = await PaymentAccount.findAll();
  const types = accounts.map((account) => account.account_type);

  expect(types).toContain('payment_processor_receivable');
  expect(types).toContain('customer_funds_clearing');

  expect(await FinanceOutboxEvent.count()).toBe(1);
  expect(await FinanceBusinessEvent.count()).toBe(1);
  expect(await FinanceAccountingEvent.count()).toBe(1);
  expect(await LedgerTransaction.count()).toBe(1);
});

test('draining the same pipeline again does not duplicate finance effects', async () => {
  await drain();

  expect(await FinanceOutboxEvent.count()).toBe(1);
  expect(await FinanceBusinessEvent.count()).toBe(1);
  expect(await FinanceAccountingEvent.count()).toBe(1);
  expect(await LedgerTransaction.count()).toBe(1);
});
