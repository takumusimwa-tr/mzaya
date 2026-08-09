const {
  procurementPayload,
} = require('../src/services/procurementFinanceEvents.service');

describe('procurement finance event', () => {
  test('keeps spend and fee components separate', () => {
    const payload = procurementPayload({
      id: '1',
      procurement_reference: 'PRC-1',
      currency: 'USD',
      merchandise_cost_minor: 10000,
      procurement_fee_minor: 1000,
      amount_spent_minor: 11000,
      amount_refundable_minor: 0,
    });

    expect(payload.merchandiseCostMinor).toBe(10000);
    expect(payload.procurementFeeMinor).toBe(1000);
    expect(payload.amountSpentMinor).toBe(11000);
  });
});
