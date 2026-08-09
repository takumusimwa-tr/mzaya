const {
  settlementPayload,
} = require('../src/services/vendorSettlementFinanceEvents.service');

describe('vendor settlement finance event', () => {
  test('uses vendor payable amount rather than gross sales', () => {
    const payload = settlementPayload({
      id: '1',
      vendor_id: '2',
      settlement_reference: 'VST-1',
      currency: 'USD',
      gross_sales_minor: 10000,
      amount_due_minor: 7500,
      amount_paid_minor: 0,
    });

    expect(payload.grossSalesMinor).toBe(10000);
    expect(payload.amountDueMinor).toBe(7500);
  });
});
