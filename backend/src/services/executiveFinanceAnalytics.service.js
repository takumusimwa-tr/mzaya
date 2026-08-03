const { Op } = require('sequelize');
const {
  OrderEconomics,
  ProfitabilitySnapshot,
  LiquiditySnapshot,
  VarianceReport,
  FinancialCloseCycle,
  TreasuryAlert,
} = require('../models/associations');

async function buildExecutiveFinanceSummary({
  currency,
  from,
  to,
}) {
  const completedAt = {
    [Op.between]: [
      new Date(`${from}T00:00:00.000Z`),
      new Date(`${to}T23:59:59.999Z`),
    ],
  };

  const [
    orderEconomics,
    profitability,
    liquidity,
    varianceReports,
    closeCycle,
    treasuryAlerts,
  ] = await Promise.all([
    OrderEconomics.findAll({
      where: { currency, completed_at: completedAt },
      raw: true,
    }),
    ProfitabilitySnapshot.findAll({
      where: {
        currency,
        snapshot_date: { [Op.between]: [from, to] },
      },
      order: [['snapshot_date', 'DESC']],
      limit: 100,
      raw: true,
    }),
    LiquiditySnapshot.findOne({
      where: { currency, snapshot_date: { [Op.lte]: to } },
      order: [['snapshot_date', 'DESC']],
      raw: true,
    }),
    VarianceReport.findAll({
      where: { currency },
      order: [['generated_at', 'DESC']],
      limit: 10,
      raw: true,
    }),
    FinancialCloseCycle.findOne({
      order: [['started_at', 'DESC']],
      raw: true,
    }),
    TreasuryAlert.findAll({
      where: { status: 'open' },
      order: [['detected_at', 'DESC']],
      limit: 20,
      raw: true,
    }),
  ]);

  const totals = orderEconomics.reduce((acc, row) => ({
    orderCount: acc.orderCount + 1,
    govMinor: acc.govMinor + Number(row.gross_order_value_minor || 0),
    revenueMinor:
      acc.revenueMinor +
      Number(row.platform_revenue_minor || 0) +
      Number(row.delivery_revenue_minor || 0) +
      Number(row.procurement_revenue_minor || 0) -
      Number(row.discounts_minor || 0) -
      Number(row.refund_minor || 0),
    contributionMinor:
      acc.contributionMinor + Number(row.contribution_margin_minor || 0),
    netMarginMinor:
      acc.netMarginMinor + Number(row.net_margin_minor || 0),
  }), {
    orderCount: 0,
    govMinor: 0,
    revenueMinor: 0,
    contributionMinor: 0,
    netMarginMinor: 0,
  });

  return {
    period: { from, to, currency },
    totals: {
      ...totals,
      revenuePerOrderMinor:
        totals.orderCount ? Math.round(totals.revenueMinor / totals.orderCount) : 0,
      contributionPerOrderMinor:
        totals.orderCount ? Math.round(totals.contributionMinor / totals.orderCount) : 0,
      contributionMarginRatio:
        totals.revenueMinor
          ? Number((totals.contributionMinor / totals.revenueMinor).toFixed(6))
          : null,
      netMarginRatio:
        totals.revenueMinor
          ? Number((totals.netMarginMinor / totals.revenueMinor).toFixed(6))
          : null,
    },
    liquidity,
    profitability,
    varianceReports,
    closeCycle,
    treasuryAlerts,
  };
}

module.exports = {
  buildExecutiveFinanceSummary,
};
