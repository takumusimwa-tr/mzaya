const cron = require('node-cron');
const {
  buildExecutiveFinanceSummary,
} = require('../services/executiveFinanceAnalytics.service');
const {
  saveKpiSnapshot,
} = require('../services/financeKpi.service');

function startFinanceKpiSnapshotJob({ logger = console } = {}) {
  return cron.schedule('15 3 * * *', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .slice(0, 10);
    const currencies = String(
      process.env.FINANCE_KPI_CURRENCIES || 'USD,ZWL'
    )
      .split(',')
      .map((value) => value.trim().toUpperCase())
      .filter(Boolean);

    for (const currency of currencies) {
      try {
        const summary = await buildExecutiveFinanceSummary({
          currency,
          from: yesterday,
          to: yesterday,
        });

        const snapshots = [
          ['gross_order_value', summary.totals.govMinor],
          ['recognized_revenue', summary.totals.revenueMinor],
          ['contribution_margin_ratio', summary.totals.contributionMarginRatio || 0],
          ['net_margin_ratio', summary.totals.netMarginRatio || 0],
          ['revenue_per_order', summary.totals.revenuePerOrderMinor],
          ['contribution_per_order', summary.totals.contributionPerOrderMinor],
        ];

        for (const [kpiKey, value] of snapshots) {
          await saveKpiSnapshot({
            kpiKey,
            snapshotDate: today,
            periodType: 'daily',
            periodKey: yesterday,
            currency,
            value,
            sourceLineage: [{ source: 'executive_finance_summary' }],
          });
        }
      } catch (error) {
        logger.error?.('finance_kpi_snapshot_failed', {
          currency,
          error: error.message,
        });
      }
    }
  });
}

module.exports = { startFinanceKpiSnapshotJob };
