const cron = require('node-cron');
const {
  ConsolidationGroup,
} = require('../models/associations');
const {
  startConsolidation,
} = require('../services/consolidation.service');

function startNightlyConsolidationJob({ logger = console } = {}) {
  return cron.schedule('30 2 * * *', async () => {
    const groups = await ConsolidationGroup.findAll({
      where: { status: 'active' },
    });

    const now = new Date();
    const periodCode =
      `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;

    for (const group of groups) {
      try {
        await startConsolidation({
          consolidationGroupId: group.id,
          periodCode,
          startedBy: null,
        });
      } catch (error) {
        logger.error?.('nightly_consolidation_failed', {
          groupId: group.id,
          error: error.message,
        });
      }
    }
  });
}

module.exports = { startNightlyConsolidationJob };
