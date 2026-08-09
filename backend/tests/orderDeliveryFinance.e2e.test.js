const {
  resetDatabase,
  closeDatabase,
  makeCity,
  makeUser,
  makeRider,
  makeOrder,
} = require('./setup');
const {
  models,
  seedFinance,
  drain,
  financeLineageForIdempotency,
} = require('./financeE2E.helpers');
const {
  updateOrderStatus,
} = require('../src/services/order.service');

const {
  OrderEconomics,
  LedgerTransaction,
} = models;

beforeAll(async () => {
  await resetDatabase();
  await seedFinance();
});

afterAll(async () => {
  await closeDatabase();
});

test('delivery completion emits order and delivery events and persists economics', async () => {
  const city = await makeCity();
  const customer = await makeUser('customer');
  const riderUser = await makeUser('rider');
  await makeRider(riderUser, city);

  const order = await makeOrder(customer, city, {
    rider_id: riderUser.id,
    status: 'en_route',
    subtotal_usd: 10,
    delivery_fee_usd: 3,
    total_usd: 13,
  });

  await updateOrderStatus(
    order.id,
    'delivered',
    riderUser.id
  );

  await drain();

  const orderLineage = await financeLineageForIdempotency(
    `order:${order.id}:completed:v1`
  );

  const deliveryLineage = await financeLineageForIdempotency(
    `delivery:${order.id}:completed:v1`
  );

  expect(orderLineage.accountingEvent.status).toBe('posted');
  expect(orderLineage.accountingEvent.metadata.nonPosting).toBe(true);

  expect(deliveryLineage.ledgerTransaction).toBeTruthy();
  expect(deliveryLineage.accountingEvent.debit_total_minor).toBe('300');

  const economics = await OrderEconomics.findOne({
    where: { order_id: order.id },
  });

  expect(Number(economics.gross_order_value_minor)).toBe(1300);
  expect(Number(economics.delivery_revenue_minor)).toBe(300);
  expect(await LedgerTransaction.count()).toBe(1);
});
