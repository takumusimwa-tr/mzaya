const {
  getFinanceMetrics,
} = require('./financeMetrics.service');
const {
  getFinanceTrend,
} = require('./financeTrend.service');
const {
  calculateContribution,
} = require('./profitability.service');
const {
  calculateCashflow,
} = require('./cashflow.service');

async function getFinanceDashboard({
  currency,
  startDate,
  endDate,
}) {
  const [metrics, trend] = await Promise.all([
    getFinanceMetrics({ currency, startDate, endDate }),
    getFinanceTrend({ currency, startDate, endDate }),
  ]);

  const profitability = calculateContribution({
    platformRevenueMinor: metrics.platformRevenueMinor,
    refundsMinor: metrics.refundsMinor,
    chargebacksMinor: metrics.chargebacksMinor,
  });

  const cashflow = calculateCashflow({
    inflowsMinor: metrics.gmvMinor,
    refundsMinor: metrics.refundsMinor,
    settlementsPaidMinor: metrics.settlementsPaidMinor,
    chargebacksMinor: metrics.chargebacksMinor,
  });

  return {
    filters: {
      currency: metrics.currency,
      startDate,
      endDate,
    },
    metrics,
    profitability,
    cashflow,
    trend,
  };
}

module.exports = {
  getFinanceDashboard,
};
