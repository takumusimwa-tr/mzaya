const cron = require('node-cron');
const { Op } = require('sequelize');
const {
  FinanceOutboxEvent,
} = require('../models/associations');
const {
  deliverOutboxEvent,
} = require('../services/financeEventDelivery.service');
const {
  quarantineOutboxEvent,
} = require('../services/financeDeadLetter.service');

function startFinanceOutboxPublisherJob({
  workerId = `finance-outbox-${process.pid}`,
  logger = console,
} = {}) {
  return cron.schedule('* * * * *', async () => {
    const events = await FinanceOutboxEvent.findAll({
      where: {
        status: { [Op.in]: ['pending', 'retry'] },
        available_at: { [Op.lte]: new Date() },
      },
      order: [['created_at', 'ASC']],
      limit: 100,
    });

    for (const event of events) {
      try {
        await deliverOutboxEvent({
          outboxEventId: event.id,
          workerId,
        });
      } catch (error) {
        logger.error?.('finance_outbox_delivery_failed', {
          outboxEventId: event.id,
          error: error.message,
        });

        const fresh = await FinanceOutboxEvent.findByPk(event.id);
        if (Number(fresh?.attempt_count || 0) >= 8) {
          await quarantineOutboxEvent({
            outboxEventId: event.id,
            reasonCode: error.code || 'DELIVERY_RETRY_EXHAUSTED',
            reason: String(error.message || error),
          });
        }
      }
    }
  });
}

module.exports = {
  startFinanceOutboxPublisherJob,
};
