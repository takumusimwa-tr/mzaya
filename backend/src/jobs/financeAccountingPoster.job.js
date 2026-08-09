const cron = require('node-cron');
const {
  FinanceAccountingEvent,
} = require('../models/associations');
const {
  postAccountingEvent,
} = require('../services/financeAccountingPosting.service');

async function postReadyAccountingEvents({
  limit = 100,
  logger = console,
} = {}) {
  const events = await FinanceAccountingEvent.findAll({
    where: {
      status: 'prepared',
    },
    order: [['prepared_at', 'ASC'], ['created_at', 'ASC']],
    limit,
  });

  let posted = 0;

  for (const event of events) {
    try {
      await postAccountingEvent({
        accountingEventId: event.id,
      });
      posted += 1;
    } catch (error) {
      logger.error?.('finance_accounting_event_post_failed', {
        accountingEventId: event.id,
        error: error.message,
      });
    }
  }

  return posted;
}

function startFinanceAccountingPosterJob({
  logger = console,
} = {}) {
  return cron.schedule('* * * * *', async () => {
    await postReadyAccountingEvents({ logger });
  });
}

module.exports = {
  postReadyAccountingEvents,
  startFinanceAccountingPosterJob,
};
