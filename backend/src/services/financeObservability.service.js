const { Op } = require('sequelize');
const {
  FinanceOutboxEvent,
  FinanceBusinessEvent,
  FinanceAccountingEvent,
  FinanceDeliveryAttempt,
  FinanceDeadLetter,
  FinancePostingFailure,
} = require('../models/associations');
const { thresholds } = require('../config/financeObservability');

function ageSeconds(date, now = Date.now()) {
  if (!date) return 0;
  return Math.max(0, Math.floor((now - new Date(date).getTime()) / 1000));
}

function severityFor(value, warn, critical) {
  if (value >= critical) return 'critical';
  if (value >= warn) return 'warning';
  return 'healthy';
}

function worstSeverity(values) {
  if (values.includes('critical')) return 'critical';
  if (values.includes('warning')) return 'warning';
  return 'healthy';
}

async function getFinanceRuntimeHealth({ now = new Date() } = {}) {
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const [
    pendingOutbox,
    oldestOutbox,
    receivedBusinessEvents,
    oldestBusinessEvent,
    preparedAccountingEvents,
    oldestAccountingEvent,
    deliveryAttempts,
    failedDeliveryAttempts,
    deadLetters,
    postingFailures,
  ] = await Promise.all([
    FinanceOutboxEvent.count({
      where: { status: { [Op.in]: ['pending', 'retry', 'processing'] } },
    }),
    FinanceOutboxEvent.findOne({
      where: { status: { [Op.in]: ['pending', 'retry', 'processing'] } },
      order: [['createdAt', 'ASC']],
      attributes: ['id', 'createdAt'],
    }),
    FinanceBusinessEvent.count({
      where: { status: { [Op.in]: ['received', 'failed'] } },
    }),
    FinanceBusinessEvent.findOne({
      where: { status: { [Op.in]: ['received', 'failed'] } },
      order: [['received_at', 'ASC']],
      attributes: ['id', 'received_at'],
    }),
    FinanceAccountingEvent.count({
      where: { status: 'prepared' },
    }),
    FinanceAccountingEvent.findOne({
      where: { status: 'prepared' },
      order: [['prepared_at', 'ASC']],
      attributes: ['id', 'prepared_at'],
    }),
    FinanceDeliveryAttempt.count({
      where: { started_at: { [Op.gte]: hourAgo } },
    }),
    FinanceDeliveryAttempt.count({
      where: {
        started_at: { [Op.gte]: hourAgo },
        status: 'failed',
      },
    }),
    FinanceDeadLetter.count({
      where: { status: { [Op.in]: ['quarantined', 'replay_requested'] } },
    }),
    FinancePostingFailure.count({
      where: { status: 'open' },
    }),
  ]);

  const outboxOldestAgeSeconds = ageSeconds(oldestOutbox?.createdAt, now.getTime());
  const businessOldestAgeSeconds = ageSeconds(oldestBusinessEvent?.received_at, now.getTime());
  const accountingOldestAgeSeconds = ageSeconds(oldestAccountingEvent?.prepared_at, now.getTime());
  const deliveryFailureRatePct = deliveryAttempts
    ? Number(((failedDeliveryAttempts / deliveryAttempts) * 100).toFixed(2))
    : 0;

  const indicators = {
    outboxBacklog: {
      value: pendingOutbox,
      unit: 'events',
      severity: severityFor(
        pendingOutbox,
        thresholds.outboxPendingWarn,
        thresholds.outboxPendingCritical
      ),
    },
    outboxOldestAge: {
      value: outboxOldestAgeSeconds,
      unit: 'seconds',
      severity: severityFor(
        outboxOldestAgeSeconds,
        thresholds.outboxOldestWarnSeconds,
        thresholds.outboxOldestCriticalSeconds
      ),
    },
    businessEventOldestAge: {
      value: businessOldestAgeSeconds,
      unit: 'seconds',
      severity: severityFor(
        businessOldestAgeSeconds,
        thresholds.businessEventOldestWarnSeconds,
        thresholds.businessEventOldestCriticalSeconds
      ),
    },
    accountingEventOldestAge: {
      value: accountingOldestAgeSeconds,
      unit: 'seconds',
      severity: severityFor(
        accountingOldestAgeSeconds,
        thresholds.accountingEventOldestWarnSeconds,
        thresholds.accountingEventOldestCriticalSeconds
      ),
    },
    deliveryFailureRate1h: {
      value: deliveryFailureRatePct,
      unit: 'percent',
      severity: severityFor(
        deliveryFailureRatePct,
        thresholds.deliveryFailureRateWarnPct,
        thresholds.deliveryFailureRateCriticalPct
      ),
    },
    deadLetters: {
      value: deadLetters,
      unit: 'events',
      severity: deadLetters >= thresholds.deadLetterCritical ? 'critical' : 'healthy',
    },
    postingFailures: {
      value: postingFailures,
      unit: 'failures',
      severity: postingFailures >= thresholds.postingFailureCritical ? 'critical' : 'healthy',
    },
  };

  return {
    status: worstSeverity(Object.values(indicators).map((item) => item.severity)),
    observedAt: now,
    pipeline: {
      pendingOutbox,
      receivedBusinessEvents,
      preparedAccountingEvents,
      deliveryAttempts1h: deliveryAttempts,
      failedDeliveryAttempts1h: failedDeliveryAttempts,
      deadLetters,
      postingFailures,
    },
    indicators,
    thresholds,
  };
}

module.exports = {
  ageSeconds,
  severityFor,
  worstSeverity,
  getFinanceRuntimeHealth,
};
