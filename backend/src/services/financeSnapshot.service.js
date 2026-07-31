const {
  FinanceDailySnapshot,
} = require('../models/associations');
const {
  getFinanceMetrics,
} = require('./financeMetrics.service');

async function createFinanceSnapshot({
  snapshotDate,
  currency,
}) {
  const metrics = await getFinanceMetrics({
    currency,
    startDate: snapshotDate,
    endDate: snapshotDate,
  });

  const [snapshot] = await FinanceDailySnapshot.upsert({
    snapshot_date: snapshotDate,
    currency: metrics.currency,
    gmv_minor: metrics.gmvMinor,
    platform_revenue_minor: metrics.platformRevenueMinor,
    refunds_minor: metrics.refundsMinor,
    chargebacks_minor: metrics.chargebacksMinor,
    settlements_paid_minor: metrics.settlementsPaidMinor,
    settlements_pending_minor: metrics.settlementsPendingMinor,
    reconciliation_matched_count: metrics.reconciliationMatchedCount,
    reconciliation_exception_count: metrics.reconciliationExceptionCount,
  }, { returning: true });

  return snapshot;
}

module.exports = {
  createFinanceSnapshot,
};
