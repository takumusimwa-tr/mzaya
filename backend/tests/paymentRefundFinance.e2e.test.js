const {
  resetDatabase,
  closeDatabase,
  makeCity,
  makeUser,
  makeOrder,
} = require('./setup');
const {
  models,
  seedFinance,
  drain,
  financeLineageForIdempotency,
} = require('./financeE2E.helpers');
const {
  emitPaymentCaptured,
} = require('../src/services/paymentFinanceEvents.service');
const {
  emitRefundCompleted,
} = require('../src/services/refundFinanceEvents.service');
const { sequelize } = require('../src/config/db');

const {
  PaymentAttempt,
  Refund,
  LedgerTransaction,
} = models;

beforeAll(async () => {
  await resetDatabase();
  await seedFinance();
});

afterAll(async () => {
  await closeDatabase();
});

test('captured payment and processed refund produce independent balanced ledger effects', async () => {
  const city = await makeCity();
  const customer = await makeUser('customer');
  const order = await makeOrder(customer, city);

  const payment = await PaymentAttempt.create({
    order_id: order.id,
    provider: 'paynow',
    provider_reference: 'PAY-E2E-1',
    amount_usd: 13,
    currency: 'USD',
    status: 'success',
    method: 'ecocash',
    resolved_at: new Date(),
  });

  await sequelize.transaction(async (transaction) => {
    await emitPaymentCaptured({
      payment,
      transaction,
    });
  });

  const refund = await Refund.create({
    order_id: order.id,
    payment_id: payment.id,
    customer_id: customer.id,
    currency: 'USD',
    amount_minor: 500,
    reason: 'E2E test refund',
    status: 'processed',
    processed_at: new Date(),
  });

  await sequelize.transaction(async (transaction) => {
    await emitRefundCompleted({
      payment,
      refund,
      transaction,
    });
  });

  await drain();

  const capture = await financeLineageForIdempotency(
    `payment:${payment.id}:captured:v1`
  );
  const refunded = await financeLineageForIdempotency(
    `refund:${refund.id}:processed:v1`
  );

  expect(capture.ledgerTransaction).toBeTruthy();
  expect(refunded.ledgerTransaction).toBeTruthy();
  expect(capture.accountingEvent.debit_total_minor).toBe('1300');
  expect(refunded.accountingEvent.debit_total_minor).toBe('500');
  expect(await LedgerTransaction.count()).toBe(2);
});
