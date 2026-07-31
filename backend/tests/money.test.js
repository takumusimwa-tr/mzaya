const {
  toMinorUnits,
  fromMinorUnits,
  assertPositiveMinorUnits,
} = require('../src/utils/money');

describe('money helpers', () => {
  test('converts decimal values to minor units', () => {
    expect(toMinorUnits(12.34)).toBe(1234);
  });

  test('converts minor units to decimal values', () => {
    expect(fromMinorUnits(1234)).toBe(12.34);
  });

  test('rejects zero-value ledger entries', () => {
    expect(() => assertPositiveMinorUnits(0))
      .toThrow('positive integer');
  });
});
