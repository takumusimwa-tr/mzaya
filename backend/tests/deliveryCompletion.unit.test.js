jest.mock('../src/models/associations', () => ({ Rider: { findOne: jest.fn() } }));
jest.mock('../src/services/orderFinanceEvents.service', () => ({ emitOrderCompleted: jest.fn() }));
jest.mock('../src/services/deliveryFinanceEvents.service', () => ({ emitDeliveryCompleted: jest.fn() }));
jest.mock('../src/services/orderEconomicsIntegration.service', () => ({ upsertOrderEconomics: jest.fn() }));
const { Rider } = require('../src/models/associations');
const { emitOrderCompleted } = require('../src/services/orderFinanceEvents.service');
const { emitDeliveryCompleted } = require('../src/services/deliveryFinanceEvents.service');
const { upsertOrderEconomics } = require('../src/services/orderEconomicsIntegration.service');
const { applyDeliveryCompletionEffects } = require('../src/services/deliveryCompletion.service');
const transaction = { LOCK: { UPDATE: 'UPDATE' } };
const order = { status: 'delivered', delivered_at: new Date(), rider_id: 'rider', delivery_fee_usd: '3.25', tip_usd: '1.50' };
beforeEach(() => jest.resetAllMocks());
test('all completion effects use caller transaction and locked rider', async () => {
  const rider = { total_earnings_usd: '10.00', total_deliveries: 2, update: jest.fn() };
  Rider.findOne.mockResolvedValue(rider);
  await applyDeliveryCompletionEffects({ order, transaction });
  expect(emitOrderCompleted).toHaveBeenCalledWith({ order, transaction });
  expect(emitDeliveryCompleted).toHaveBeenCalledWith({ order, deliveredAt: order.delivered_at, transaction });
  expect(upsertOrderEconomics).toHaveBeenCalledWith({ order, transaction });
  expect(Rider.findOne).toHaveBeenCalledWith({ where: { user_id: 'rider' }, transaction, lock: 'UPDATE' });
  expect(rider.update).toHaveBeenCalledWith({ total_earnings_usd: 14.75, total_deliveries: 3 }, { transaction });
});
test('finance failure propagates to transaction owner', async () => {
  emitDeliveryCompleted.mockRejectedValue(new Error('finance failed'));
  await expect(applyDeliveryCompletionEffects({ order, transaction })).rejects.toThrow('finance failed');
  expect(Rider.findOne).not.toHaveBeenCalled();
});
test('missing rider fails rather than silently losing earnings', async () => {
  Rider.findOne.mockResolvedValue(null);
  await expect(applyDeliveryCompletionEffects({ order, transaction })).rejects.toThrow('Mzaya profile not found');
});
test('rejects missing transaction or non-delivered order', async () => {
  await expect(applyDeliveryCompletionEffects({ order })).rejects.toThrow('requires');
  await expect(applyDeliveryCompletionEffects({ order: { ...order, status: 'en_route' }, transaction })).rejects.toThrow('requires');
  expect(emitOrderCompleted).not.toHaveBeenCalled();
});
