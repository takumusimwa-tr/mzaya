const { Op } = require('sequelize');
const {
  FinanceReplayQueue,
  FinanceBusinessEvent,
} = require('../models/associations');
const {
  processBusinessEvent,
} = require('./financeEventEngine.service');
const {
  financeEventEngineEvents,
  FINANCE_EVENT_ENGINE_EVENT,
} = require('../events/financeEventEngine.events');

async function queueReplay({
  businessEventId,
  reason,
  requestedBy = null,
}) {
  const [item] = await FinanceReplayQueue.findOrCreate({
    where: {
      business_event_id: businessEventId,
      status: 'queued',
    },
    defaults: {
      replay_reason: reason,
      requested_by: requestedBy,
      next_attempt_at: new Date(),
    },
  });

  financeEventEngineEvents.emit(
    FINANCE_EVENT_ENGINE_EVENT.REPLAY_QUEUED,
    {
      replayQueueId: item.id,
      businessEventId,
    }
  );

  return item;
}

async function processReplayItem(item) {
  try {
    await item.update({
      status: 'processing',
      attempts: Number(item.attempts || 0) + 1,
      last_attempt_at: new Date(),
    });

    await FinanceBusinessEvent.update({
      status: 'received',
      failure_reason: null,
      failed_at: null,
    }, {
      where: { id: item.business_event_id },
    });

    await processBusinessEvent({
      businessEventId: item.business_event_id,
    });

    await item.update({
      status: 'completed',
      completed_at: new Date(),
      failure_reason: null,
    });

    financeEventEngineEvents.emit(
      FINANCE_EVENT_ENGINE_EVENT.REPLAY_COMPLETED,
      {
        replayQueueId: item.id,
        businessEventId: item.business_event_id,
      }
    );
  } catch (error) {
    const attempts = Number(item.attempts || 0) + 1;
    const backoffMinutes = Math.min(360, 2 ** Math.min(attempts, 8));

    await item.update({
      status: attempts >= 8 ? 'dead_letter' : 'queued',
      next_attempt_at: new Date(Date.now() + backoffMinutes * 60 * 1000),
      failure_reason: String(error.message || error).slice(0, 1500),
    });

    throw error;
  }

  return item;
}

async function getReadyReplayItems(limit = 50) {
  return FinanceReplayQueue.findAll({
    where: {
      status: 'queued',
      next_attempt_at: { [Op.lte]: new Date() },
    },
    order: [['next_attempt_at', 'ASC']],
    limit,
  });
}

module.exports = {
  queueReplay,
  processReplayItem,
  getReadyReplayItems,
};
