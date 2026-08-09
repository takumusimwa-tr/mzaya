const cron = require('node-cron');
const { Op } = require('sequelize');
const {
  FinanceBusinessEvent,
} = require('../models/associations');

function startOrphanEventJob({ logger = console } = {}) {
  return cron.schedule('40 * * * *', async () => {
    try {
      const cutoff = new Date(Date.now() - 60 * 60 * 1000);

      const count = await FinanceBusinessEvent.count({
        where: {
          status: { [Op.in]: ['received', 'processing'] },
          received_at: { [Op.lt]: cutoff },
        },
      });

      if (count > 0) {
        logger.warn?.('finance_orphan_events_detected', {
          count,
          cutoff,
        });
      }
    } catch (error) {
      logger.error?.('finance_orphan_event_job_failed', {
        error: error.message,
      });
    }
  });
}

module.exports = {
  startOrphanEventJob,
};
