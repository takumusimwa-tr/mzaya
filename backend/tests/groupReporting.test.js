const {
  aggregateGroupBalances,
} = require('../src/services/groupReporting.service');

describe('group reporting', () => {
  test('aggregates entity balances and eliminations', () => {
    expect(aggregateGroupBalances({
      entityBalances: [
        {
          assetsMinor: 10000,
          liabilitiesMinor: 4000,
          equityMinor: 6000,
          revenueMinor: 8000,
          expensesMinor: 3000,
        },
      ],
      eliminationEntries: [
        { debit_minor: 1000, credit_minor: 1000 },
      ],
    })).toEqual({
      assetsMinor: 10000,
      liabilitiesMinor: 4000,
      equityMinor: 6000,
      revenueMinor: 8000,
      expensesMinor: 3000,
      eliminationNetMinor: 0,
      netIncomeMinor: 5000,
      balanceSheetBalanced: true,
    });
  });
});
