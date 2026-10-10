const { Op } = require('sequelize');
const {
  OrderEconomics,
  ProfitabilitySnapshot,
} = require('../models/associations');

function calculateContribution({
  platformRevenueMinor,
  refundsMinor = 0,
  chargebacksMinor = 0,
  operationalCostsMinor = 0,
}) {
  const revenue = Number(platformRevenueMinor || 0);
  const refunds = Number(refundsMinor || 0);
  const chargebacks = Number(chargebacksMinor || 0);
  const operationalCosts = Number(operationalCostsMinor || 0);

  const contributionMinor =
    revenue - refunds - chargebacks - operationalCosts;

  return {
    contributionMinor,
    contributionMargin:
      revenue === 0
        ? 0
        : Number((contributionMinor / revenue).toFixed(6)),
  };
}

async function buildProfitabilitySnapshot({
  snapshotDate,
  dimensionType,
  dimensionValue,
  currency,
}) {
  const map = {
    city: 'city_code',
    vendor: 'vendor_id',
    category: 'service_category',
    customer: 'customer_id',
    mzaya: 'mzaya_id',
  };

  const field = map[dimensionType];

  if (!field) {
    const error = new Error('Unsupported profitability dimension');
    error.status = 422;
    throw error;
  }

  const start = new Date(`${snapshotDate}T00:00:00.000Z`);
  const end = new Date(`${snapshotDate}T23:59:59.999Z`);

  const orders = await OrderEconomics.findAll({
    where: {
      [field]: dimensionValue,
      currency,
      completed_at: {
        [Op.between]: [start, end],
      },
    },
  });

  const totals = orders.reduce(
    (accumulator, order) => ({
      gov: accumulator.gov + Number(order.gross_order_value_minor || 0),
      revenue:
        accumulator.revenue +
        Number(order.platform_revenue_minor || 0) +
        Number(order.delivery_revenue_minor || 0) +
        Number(order.procurement_revenue_minor || 0) -
        Number(order.discounts_minor || 0) -
        Number(order.refund_minor || 0),
      direct:
        accumulator.direct +
        Number(order.direct_cost_minor || 0) +
        Number(order.gateway_fees_minor || 0) +
        Number(order.mzaya_payout_minor || 0),
      overhead:
        accumulator.overhead +
        Number(order.allocated_overhead_minor || 0),
      contribution:
        accumulator.contribution +
        Number(order.contribution_margin_minor || 0),
      net:
        accumulator.net +
        Number(order.net_margin_minor || 0),
    }),
    {
      gov: 0,
      revenue: 0,
      direct: 0,
      overhead: 0,
      contribution: 0,
      net: 0,
    }
  );

  const [snapshot] = await ProfitabilitySnapshot.upsert(
    {
      snapshot_date: snapshotDate,
      dimension_type: dimensionType,
      dimension_value: String(dimensionValue),
      currency,
      order_count: orders.length,
      gross_order_value_minor: totals.gov,
      recognized_revenue_minor: totals.revenue,
      direct_cost_minor: totals.direct,
      allocated_overhead_minor: totals.overhead,
      contribution_margin_minor: totals.contribution,
      contribution_margin_ratio:
        totals.revenue === 0
          ? null
          : totals.contribution / totals.revenue,
      net_margin_minor: totals.net,
    },
    {
      returning: true,
    }
  );

  return snapshot;
}

module.exports = {
  calculateContribution,
  buildProfitabilitySnapshot,
};
