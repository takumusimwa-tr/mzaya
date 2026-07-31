/**
 * Finance dashboard cash position derived from operational movements.
 * Provider clearing balances remain the authoritative financial source.
 */
function calculateCashflow({
  inflowsMinor,
  refundsMinor,
  settlementsPaidMinor,
  chargebacksMinor,
}) {
  const outflows =
    Number(refundsMinor || 0) +
    Number(settlementsPaidMinor || 0) +
    Number(chargebacksMinor || 0);

  return {
    inflowsMinor: Number(inflowsMinor || 0),
    outflowsMinor: outflows,
    netCashflowMinor: Number(inflowsMinor || 0) - outflows,
  };
}

module.exports = {
  calculateCashflow,
};
