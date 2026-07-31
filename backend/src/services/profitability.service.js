/**
 * Computes a conservative operational contribution metric.
 * This is not statutory accounting profit and should be labeled accordingly.
 */
function calculateContribution({
  platformRevenueMinor,
  refundsMinor,
  chargebacksMinor,
  operationalCostsMinor = 0,
}) {
  const revenue = Number(platformRevenueMinor || 0);
  const deductions =
    Number(refundsMinor || 0) +
    Number(chargebacksMinor || 0) +
    Number(operationalCostsMinor || 0);

  const contributionMinor = revenue - deductions;
  const margin = revenue > 0
    ? Number((contributionMinor / revenue).toFixed(4))
    : 0;

  return {
    contributionMinor,
    contributionMargin: margin,
  };
}

module.exports = {
  calculateContribution,
};
