const cron = require('node-cron');
const {
  BudgetVersion,
  ForecastVersion,
} = require('../models/associations');
const {
  generateVarianceReport,
} = require('../services/variance.service');

function startBudgetVarianceJob({ logger = console } = {}) {
  return cron.schedule('15 2 1 * *', async () => {
    try {
      const budgetVersion = await BudgetVersion.findOne({
        where: { status: 'approved' },
        order: [['approved_at', 'DESC']],
      });

      if (!budgetVersion) return;

      const now = new Date();
      const period = `${now.getUTCFullYear()}-${String(now.getUTCMonth()).padStart(2, '0')}`;

      await generateVarianceReport({
        reportType: 'actual_vs_budget',
        currency: 'USD',
        periodFrom: period,
        periodTo: period,
        budgetVersionId: budgetVersion.id,
        generatedBy: null,
      });
    } catch (error) {
      logger.error?.('budget_variance_job_failed', {
        error: error.message,
      });
    }
  });
}

module.exports = {
  startBudgetVarianceJob,
};
