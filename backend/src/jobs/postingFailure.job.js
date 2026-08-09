const cron = require('node-cron');
const { Op } = require('sequelize');
const {
  FinancePostingFailure,
} = require('../models/associations');
const {
  queueReplay,
} = require('../services/financeReplay.service');

function startPostingFailureJob({ logger = console } = {}) {
  return cron.schedule('20 * * * *', async () => {
    try {
      const failures = await FinancePostingFailure.findAll({
        where: {
          status: 'open',
          business_event_id: { [Op.ne]: null },
          occurrence_count: { [Op.lte]: 3 },
        },
        limit: 50,
      });

      for (const failure of failures) {
        await queueReplay({
          businessEventId: failure.business_event_id,
          reason: `Automatic replay for ${failure.failure_code}`,
        });
      }
    } catch (error) {
      logger.error?.('finance_posting_failure_job_failed', {
        error: error.message,
      });
    }
  });
}

module.exports = {
  startPostingFailureJob,
};
