const cron = require('node-cron');
const {
  FinanceCutoverControl,
} = require('../models/associations');
const {
  evaluateCutoverReadiness,
} = require('../services/financeCutoverReadiness.service');

function startFinanceCutoverReadinessJob({
  logger = console,
} = {}) {
  return cron.schedule('20 */2 * * *', async () => {
    const controls = await FinanceCutoverControl.findAll({
      where: {
        status: ['planned', 'validating', 'ready'],
      },
    });

    for (const control of controls) {
      try {
        const result = await evaluateCutoverReadiness(control);

        await control.update({
          status: result.ready ? 'ready' : 'validating',
        });
      } catch (error) {
        logger.error?.('finance_cutover_readiness_failed', {
          controlId: control.id,
          error: error.message,
        });
      }
    }
  });
}

module.exports = {
  startFinanceCutoverReadinessJob,
};
