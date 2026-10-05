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
} = require('./financeE2E.helpers');
const {
  applyProviderOutcome,
} = require('../src/services/providerOutcome.service');

const {
  PaymentAttempt,
  ProviderCallbackReceipt,
  FinanceOutboxEvent,
} = models;

beforeAll(async () => {
  await resetDatabase();
  await seedFinance();
});

afterAll(async () => {
  await closeDatabase();
});

test('duplicate provider callbacks converge to one payment capture event', async () => {
  const city = await makeCity();
  const customer = await makeUser('customer');
  const order = await makeOrder(customer, city);

  const payment = await PaymentAttempt.create({
    order_id: order.id,
    provider: 'paynow',
    amount_usd: 10,
    currency: 'USD',
    status: 'pending',
    method: 'ecocash',
    idempotency_key: `stress-provider:${order.id}:capture-1`,      });

  const payload = {
    reference: 'provider-callback-1',
    amount: 10,
  };

  await Promise.all([
    applyProviderOutcome({
      provider: 'paynow',
      paymentId: payment.id,
      providerReference: 'PAYNOW-1',
      rawStatus: 'Paid',
      payload,
    }),
    applyProviderOutcome({
      provider: 'paynow',
      paymentId: payment.id,
      providerReference: 'PAYNOW-1',
      rawStatus: 'Paid',
      payload,
    }),
  ]);

  await drain();

  const refreshed = await PaymentAttempt.findByPk(payment.id);
  expect(refreshed.status).toBe('success');

  expect(
    await ProviderCallbackReceipt.count()
  ).toBe(1);

  expect(
    await FinanceOutboxEvent.count({
      where: {
        idempotency_key:
          `payment:${payment.id}:captured:v1`,
      },
    })
  ).toBe(1);
});

test('success outcome wins over later failed duplicate noise', async () => {
  const city = await makeCity();
  const customer = await makeUser('customer');
  const order = await makeOrder(customer, city);

  const payment = await PaymentAttempt.create({
    order_id: order.id,
    provider: 'paynow',
    amount_usd: 10,
    currency: 'USD',
    status: 'pending',
    method: 'ecocash',
    idempotency_key: `stress-provider:${order.id}:capture-2`,      });

  await applyProviderOutcome({
    provider: 'paynow',
    paymentId: payment.id,
    providerReference: 'PAYNOW-2',
    rawStatus: 'Paid',
    payload: { sequence: 1 },
  });

  await applyProviderOutcome({
    provider: 'paynow',
    paymentId: payment.id,
    providerReference: 'PAYNOW-2',
    rawStatus: 'Failed',
    payload: { sequence: 2 },
  });

  const refreshed = await PaymentAttempt.findByPk(payment.id);
  expect(refreshed.status).toBe('success');
});
