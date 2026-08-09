const {
  payoutPayload,
} = require('../src/services/mzayaPayoutFinanceEvents.service');

describe('Mzaya payout finance event', () => {
  test('keeps payout components separate', () => {
    const payload = payoutPayload({
      id: '1',
      mzaya_id: '2',
      payout_reference: 'MPO-1',
      currency: 'USD',
      delivery_earnings_minor: 10000,
      tips_minor: 500,
      amount_due_minor: 10500,
      amount_paid_minor: 0,
    });

    expect(payload.deliveryEarningsMinor).toBe(10000);
    expect(payload.tipsMinor).toBe(500);
    expect(payload.amountDueMinor).toBe(10500);
  });
});
