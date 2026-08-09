const {
  taxPayload,
} = require('../src/services/taxFinanceEvents.service');

describe('tax finance event', () => {
  test('keeps tax code, base, and amount explicit', () => {
    const payload = taxPayload({
      id: '1',
      tax_reference: 'TAX-1',
      source_type: 'order',
      tax_code: 'VAT_STD',
      tax_type: 'vat',
      currency: 'USD',
      taxable_base_minor: 10000,
      tax_rate_bps: 1500,
      tax_amount_minor: 1500,
      tax_inclusive: false,
      direction: 'payable',
    });

    expect(payload.taxableBaseMinor).toBe(10000);
    expect(payload.taxAmountMinor).toBe(1500);
  });
});
