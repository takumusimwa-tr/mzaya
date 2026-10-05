const { Op } = require('sequelize');
const {
  FinanceOutboxEvent,
  FinanceBusinessEvent,
  FinanceAccountingEvent,
  FinanceDeliveryAttempt,
  FinanceDeadLetter,
  FinancePostingFailure,
} = require('../models/associations');
const {
  getFinanceRuntimeHealth,
} = require('./financeObservability.service');

async function getFinanceIncidentDiagnostics({ limit = 25 } = {}) {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 25, 100));

  const [
    health,
    outbox,
    businessEvents,
    accountingEvents,
    deliveryFailures,
    deadLetters,
    postingFailures,
  ] = await Promise.all([
    getFinanceRuntimeHealth(),
    FinanceOutboxEvent.findAll({
      where: { status: { [Op.in]: ['pending', 'retry', 'processing', 'dead_letter'] } },
      order: [['createdAt', 'ASC']],
      limit: safeLimit,
    }),
    FinanceBusinessEvent.findAll({
      where: { status: { [Op.in]: ['received', 'failed'] } },
      order: [['received_at', 'ASC']],
      limit: safeLimit,
    }),
    FinanceAccountingEvent.findAll({
      where: { status: { [Op.in]: ['prepared', 'failed'] } },
      order: [['prepared_at', 'ASC']],
      limit: safeLimit,
    }),
    FinanceDeliveryAttempt.findAll({
      where: { status: 'failed' },
      order: [['started_at', 'DESC']],
      limit: safeLimit,
    }),
    FinanceDeadLetter.findAll({
      where: { status: { [Op.in]: ['quarantined', 'replay_requested'] } },
      order: [['quarantined_at', 'ASC']],
      limit: safeLimit,
    }),
    FinancePostingFailure.findAll({
      where: { status: 'open' },
      order: [['last_occurred_at', 'DESC']],
      limit: safeLimit,
    }),
  ]);

  return {
    health,
    queues: {
      outbox,
      businessEvents,
      accountingEvents,
    },
    failures: {
      deliveryFailures,
      deadLetters,
      postingFailures,
    },
  };
}

module.exports = {
  getFinanceIncidentDiagnostics,
};
