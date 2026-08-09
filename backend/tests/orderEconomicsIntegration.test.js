const {
  economicsFromOrder,
} = require('../src/services/orderEconomicsIntegration.service');

describe('order economics integration', () => {
  test('separates GOV from Mzaya revenue', () => {
    const result = economicsFromOrder({
      id: '1',
      currency: 'USD',
      total_amount_minor: 20000,
      service_fee_minor: 1000,
      delivery_fee_minor: 1500,
    }, 'food');

    expect(result.gross_order_value_minor).toBe(20000);
    expect(result.platform_revenue_minor).toBe(1000);
    expect(result.delivery_revenue_minor).toBe(1500);
  });
});
