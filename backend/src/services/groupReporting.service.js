function aggregateGroupBalances({
  entityBalances,
  eliminationEntries,
}) {
  const totals = entityBalances.reduce(
    (accumulator, balance) => ({
      assetsMinor:
        accumulator.assetsMinor + Number(balance.assetsMinor || 0),
      liabilitiesMinor:
        accumulator.liabilitiesMinor + Number(balance.liabilitiesMinor || 0),
      equityMinor:
        accumulator.equityMinor + Number(balance.equityMinor || 0),
      revenueMinor:
        accumulator.revenueMinor + Number(balance.revenueMinor || 0),
      expensesMinor:
        accumulator.expensesMinor + Number(balance.expensesMinor || 0),
    }),
    {
      assetsMinor: 0,
      liabilitiesMinor: 0,
      equityMinor: 0,
      revenueMinor: 0,
      expensesMinor: 0,
    }
  );

  const eliminationNet = eliminationEntries.reduce(
    (sum, entry) =>
      sum + Number(entry.debit_minor || 0) - Number(entry.credit_minor || 0),
    0
  );

  return {
    ...totals,
    eliminationNetMinor: eliminationNet,
    netIncomeMinor: totals.revenueMinor - totals.expensesMinor,
    balanceSheetBalanced:
      totals.assetsMinor === totals.liabilitiesMinor + totals.equityMinor,
  };
}

module.exports = { aggregateGroupBalances };
