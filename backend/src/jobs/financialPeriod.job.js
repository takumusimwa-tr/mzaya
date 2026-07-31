const cron = require('node-cron');
const { FinancialPeriod } = require('../models/associations');

function periodCode(date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

async function ensureCurrentFinancialPeriod() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));

  const [period] = await FinancialPeriod.findOrCreate({
    where: { code: periodCode(now) },
    defaults: {
      start_date: start.toISOString().slice(0, 10),
      end_date: end.toISOString().slice(0, 10),
      status: 'open',
    },
  });

  return period;
}

function startFinancialPeriodJob({ logger = console } = {}) {
  return cron.schedule('5 0 1 * *', () => {
    ensureCurrentFinancialPeriod().catch((error) => {
      logger.error?.('financial_period_creation_failed', {
        error: error.message,
      });
    });
  });
}

module.exports = {
  periodCode,
  ensureCurrentFinancialPeriod,
  startFinancialPeriodJob,
};
