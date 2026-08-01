function calculateTreasuryForecast({
  openingCashMinor,
  expectedInflowsMinor,
  expectedOutflowsMinor,
  minimumReserveMinor = 0,
}) {
  const closingCashMinor =
    Number(openingCashMinor || 0) +
    Number(expectedInflowsMinor || 0) -
    Number(expectedOutflowsMinor || 0);

  return {
    openingCashMinor: Number(openingCashMinor || 0),
    expectedInflowsMinor: Number(expectedInflowsMinor || 0),
    expectedOutflowsMinor: Number(expectedOutflowsMinor || 0),
    closingCashMinor,
    reserveGapMinor: Math.max(
      0,
      Number(minimumReserveMinor || 0) - closingCashMinor
    ),
    belowReserve: closingCashMinor < Number(minimumReserveMinor || 0),
  };
}

module.exports = { calculateTreasuryForecast };
