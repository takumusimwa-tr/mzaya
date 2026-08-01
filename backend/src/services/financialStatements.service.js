function buildIncomeStatement(lines) {
  const revenue = lines
    .filter((line) => String(line.account_type).includes('revenue'))
    .reduce((sum, line) => sum + Number(line.credit_minor) - Number(line.debit_minor), 0);

  const expenses = lines
    .filter((line) => String(line.account_type).includes('expense'))
    .reduce((sum, line) => sum + Number(line.debit_minor) - Number(line.credit_minor), 0);

  return {
    revenueMinor: revenue,
    expensesMinor: expenses,
    netIncomeMinor: revenue - expenses,
  };
}

function buildBalanceSheet(lines) {
  const assets = lines
    .filter((line) => String(line.account_type).includes('asset'))
    .reduce((sum, line) => sum + Number(line.debit_minor) - Number(line.credit_minor), 0);

  const liabilities = lines
    .filter((line) => String(line.account_type).includes('liability'))
    .reduce((sum, line) => sum + Number(line.credit_minor) - Number(line.debit_minor), 0);

  const equity = lines
    .filter((line) => String(line.account_type).includes('equity'))
    .reduce((sum, line) => sum + Number(line.credit_minor) - Number(line.debit_minor), 0);

  return {
    assetsMinor: assets,
    liabilitiesMinor: liabilities,
    equityMinor: equity,
    balanced: assets === liabilities + equity,
  };
}

module.exports = {
  buildIncomeStatement,
  buildBalanceSheet,
};
