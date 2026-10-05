const cron = require('node-cron');
const { logger } = require('../utils/logger');
const {
  getFinanceRuntimeHealth,
} = require('../services/financeObservability.service');

async function observeFinanceRuntime() {
  const health = await getFinanceRuntimeHealth();

  const payload = {
    status: health.status,
    pipeline: health.pipeline,
    indicators: health.indicators,
  };

  if (health.status === 'critical') {
    logger.error('finance_runtime_slo_critical', payload);
  } else if (health.status === 'warning') {
    logger.warn('finance_runtime_slo_warning', payload);
  } else {
    logger.info('finance_runtime_slo_healthy', payload);
  }

  return health;
}

function startFinanceObservabilityJob() {
  return cron.schedule('*/5 * * * *', async () => {
    try {
      await observeFinanceRuntime();
    } catch (error) {
      logger.error('finance_observability_job_failed', {
        error: error.message,
        code: error.code,
      });
    }
  });
}

module.exports = {
  observeFinanceRuntime,
  startFinanceObservabilityJob,
};
