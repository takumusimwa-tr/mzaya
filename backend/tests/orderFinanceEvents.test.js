const {
  normalizeOrderType,
  orderBasePayload,
} = require('../src/services/orderFinanceEvents.service');

describe('order finance events', () => {
  test('normalizes supported order types', () => {
    expect(normalizeOrderType('orderFood')).toBe('food');
    expect(normalizeOrderType('grocery')).toBe('grocery');
  });

  test('extracts fee components', () => {
    const payload = orderBasePayload({
      id: '123',
      currency: 'USD',
      total_amount_minor: 10000,
      delivery_fee_minor: 1000,
      service_fee_minor: 500,
    }, 'food');

    expect(payload.grossOrderValueMinor).toBe(10000);
    expect(payload.deliveryFeeMinor).toBe(1000);
    expect(payload.platformFeeMinor).toBe(500);
  });
});
