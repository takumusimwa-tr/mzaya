const {
  sanitizeDestination,
} = require('../src/services/settlementProfile.service');

describe('settlement profile security', () => {
  test('keeps approved payout destination fields', () => {
    expect(sanitizeDestination({
      destinationToken: 'token-1',
      bankName: 'Example Bank',
      accountLast4: '1234',
    })).toEqual({
      destinationToken: 'token-1',
      bankName: 'Example Bank',
      accountLast4: '1234',
    });
  });

  test('removes raw account and secret fields', () => {
    expect(sanitizeDestination({
      accountNumber: '123456789',
      secret: 'do-not-store',
      accountLast4: '6789',
    })).toEqual({
      accountLast4: '6789',
    });
  });
});
