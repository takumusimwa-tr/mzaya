const cron = require('node-cron');
const {
  getReadyReplayItems,
  processReplayItem,
} = require('../services/financeReplay.service');

function startFinanceReplayJob({ logger = console } = {}) {
  return cron.schedule('*/10 * * * *', async () => {
    const items = await getReadyReplayItems(50);

    for (const item of items) {
      try {
        await processReplayItem(item);
      } catch (error) {
        logger.error?.('finance_replay_item_failed', {
          replayQueueId: item.id,
          businessEventId: item.business_event_id,
          error: error.message,
        });
      }
    }
  });
}

module.exports = {
  startFinanceReplayJob,
};
