const {
  determineChargebackStatus,
} = require('../src/services/chargeback.service');

describe('chargeback outcomes', () => {
  test('maps won outcomes', () => {
    expect(determineChargebackStatus('won')).toBe('won');
  });

  test('maps lost outcomes', () => {
    expect(determineChargebackStatus('lost')).toBe('lost');
  });

  test('defaults to under review', () => {
    expect(determineChargebackStatus('pending')).toBe('under_review');
  });
});
