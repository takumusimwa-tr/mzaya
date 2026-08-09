const { Op } = require('sequelize');
const {
  FinanceOutboxEvent,
} = require('../models/associations');
const {
  deliverOutboxEvent,
} = require('./financeEventDelivery.service');
const {
  processReadyBusinessEvents,
} = require('../jobs/financeBusinessEventProcessor.job');
const {
  postReadyAccountingEvents,
} = require('../jobs/financeAccountingPoster.job');

async function deliverReadyOutboxEvents({
  workerId = `finance-drain-${process.pid}`,
  limit = 100,
  logger = console,
} = {}) {
  const events = await FinanceOutboxEvent.findAll({
    where: {
      status: {
        [Op.in]: ['pending', 'retry'],
      },
      available_at: {
        [Op.lte]: new Date(),
      },
    },
    order: [['created_at', 'ASC']],
    limit,
  });

  let delivered = 0;

  for (const event of events) {
    try {
      const result = await deliverOutboxEvent({
        outboxEventId: event.id,
        workerId,
      });
      if (result) delivered += 1;
    } catch (error) {
      logger.error?.('finance_pipeline_outbox_delivery_failed', {
        outboxEventId: event.id,
        error: error.message,
      });
    }
  }

  return delivered;
}

async function drainFinancePipeline({
  maxPasses = 10,
  logger = console,
} = {}) {
  const summary = {
    passes: 0,
    delivered: 0,
    processed: 0,
    posted: 0,
  };

  for (let pass = 0; pass < maxPasses; pass += 1) {
    const delivered = await deliverReadyOutboxEvents({ logger });
    const processed = await processReadyBusinessEvents({ logger });
    const posted = await postReadyAccountingEvents({ logger });

    summary.passes += 1;
    summary.delivered += delivered;
    summary.processed += processed;
    summary.posted += posted;

    if (delivered + processed + posted === 0) {
      break;
    }
  }

  return summary;
}

module.exports = {
  deliverReadyOutboxEvents,
  drainFinancePipeline,
};
