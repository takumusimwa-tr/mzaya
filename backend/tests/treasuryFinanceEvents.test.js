const {
  transferPayload,
} = require('../src/services/treasuryFinanceEvents.service');

describe('treasury finance event', () => {
  test('keeps provider reference and amount', () => {
    const payload = transferPayload({
      id: '1',
      transfer_reference: 'TRF-1',
      transfer_type: 'vendor_payout',
      currency: 'USD',
      amount_minor: 10000,
      provider_reference: 'ABC123',
    });

    expect(payload.amountMinor).toBe(10000);
    expect(payload.providerReference).toBe('ABC123');
  });
});
