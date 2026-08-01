const {
  validateBatchItems,
} = require('../src/services/paymentBatch.service');

describe('treasury payment batches', () => {
  test('requires one currency per batch', () => {
    expect(() => validateBatchItems([
      { currency: 'USD', amountMinor: 1000 },
      { currency: 'ZWL', amountMinor: 2000 },
    ])).toThrow('one currency');
  });

  test('calculates batch total', () => {
    expect(validateBatchItems([
      { currency: 'USD', amountMinor: 1000 },
      { currency: 'USD', amountMinor: 2000 },
    ])).toEqual({
      currency: 'USD',
      totalMinor: 3000,
    });
  });
});
