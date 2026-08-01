const {
  parseMinorUnits,
  normalizeStatementRow,
} = require('../src/services/bankStatementParser.service');

describe('bank statement parser', () => {
  test('converts decimal amounts to minor units', () => {
    expect(parseMinorUnits('1,234.56')).toBe(123456);
  });

  test('infers debit direction from negative values', () => {
    const row = normalizeStatementRow({
      date: '2026-08-01',
      amount: '-25.40',
      description: 'Payout',
      reference: 'TX-1',
    }, 1);

    expect(row.direction).toBe('debit');
    expect(row.amountMinor).toBe(2540);
  });
});
