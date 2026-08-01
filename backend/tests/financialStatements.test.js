const {
  buildIncomeStatement,
  buildBalanceSheet,
} = require('../src/services/financialStatements.service');

describe('financial statements', () => {
  test('builds income statement totals', () => {
    expect(buildIncomeStatement([
      {
        account_type: 'service_fee_revenue',
        debit_minor: 0,
        credit_minor: 10000,
      },
      {
        account_type: 'operating_expense',
        debit_minor: 2500,
        credit_minor: 0,
      },
    ])).toEqual({
      revenueMinor: 10000,
      expensesMinor: 2500,
      netIncomeMinor: 7500,
    });
  });

  test('checks balance sheet equality', () => {
    expect(buildBalanceSheet([
      {
        account_type: 'asset',
        debit_minor: 10000,
        credit_minor: 0,
      },
      {
        account_type: 'liability',
        debit_minor: 0,
        credit_minor: 6000,
      },
      {
        account_type: 'equity',
        debit_minor: 0,
        credit_minor: 4000,
      },
    ]).balanced).toBe(true);
  });
});
