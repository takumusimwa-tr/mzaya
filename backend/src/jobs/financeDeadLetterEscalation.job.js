const cron = require('node-cron');
const { Op } = require('sequelize');
const {
  FinanceDeadLetter,
} = require('../models/associations');

function startFinanceDeadLetterEscalationJob({ logger = console } = {}) {
  return cron.schedule('0 * * * *', async () => {
    try {
      const cutoff = new Date(Date.now() - 60 * 60 * 1000);

      const count = await FinanceDeadLetter.count({
        where: {
          status: 'quarantined',
          quarantined_at: { [Op.lt]: cutoff },
        },
      });

      if (count > 0) {
        logger.error?.('finance_dead_letters_unreviewed', {
          count,
        });
      }
    } catch (error) {
      logger.error?.('finance_dead_letter_escalation_failed', {
        error: error.message,
      });
    }
  });
}

module.exports = {
  startFinanceDeadLetterEscalationJob,
};
