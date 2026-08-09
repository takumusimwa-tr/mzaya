const cron = require('node-cron');
const { Op } = require('sequelize');
const {
  FinanceBusinessEvent,
} = require('../models/associations');
const {
  processBusinessEvent,
} = require('../services/financeEventEngine.service');

async function processReadyBusinessEvents({
  limit = 100,
  logger = console,
} = {}) {
  const events = await FinanceBusinessEvent.findAll({
    where: {
      status: {
        [Op.in]: ['received', 'failed'],
      },
    },
    order: [['occurred_at', 'ASC'], ['created_at', 'ASC']],
    limit,
  });

  let processed = 0;

  for (const event of events) {
    try {
      await processBusinessEvent({
        businessEventId: event.id,
      });
      processed += 1;
    } catch (error) {
      logger.error?.('finance_business_event_processing_failed', {
        businessEventId: event.id,
        error: error.message,
      });
    }
  }

  return processed;
}

function startFinanceBusinessEventProcessorJob({
  logger = console,
} = {}) {
  return cron.schedule('* * * * *', async () => {
    await processReadyBusinessEvents({ logger });
  });
}

module.exports = {
  processReadyBusinessEvents,
  startFinanceBusinessEventProcessorJob,
};
