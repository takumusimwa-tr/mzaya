const { Op, fn, col } = require('sequelize');
const {
  FinanceOutboxEvent,
  FinanceDeliveryAttempt,
  FinanceDeadLetter,
  FinanceDeliveryLease,
  FinanceConsumerOffset,
  FinanceReliabilitySnapshot,
} = require('../models/associations');
const {
  financeDeliveryEvents,
  FINANCE_DELIVERY_EVENT,
} = require('../events/financeDelivery.events');

function percentile(values, ratio) {
  const numeric = values.map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  if (!numeric.length) return null;
  const index = Math.min(
    numeric.length - 1,
    Math.max(0, Math.ceil(ratio * numeric.length) - 1)
  );
  return numeric[index];
}

async function buildReliabilitySnapshot({
  sourceSystem = null,
}) {
  const where = sourceSystem ? { source_system: sourceSystem } : {};

  const [
    pendingCount,
    publishedCount,
    failedCount,
    deadLetterCount,
    staleLeaseCount,
    oldestPending,
    attempts,
    consumers,
  ] = await Promise.all([
    FinanceOutboxEvent.count({
      where: {
        ...where,
        status: { [Op.in]: ['pending', 'retry', 'publishing'] },
      },
    }),
    FinanceOutboxEvent.count({
      where: { ...where, status: 'published' },
    }),
    FinanceOutboxEvent.count({
      where: { ...where, status: 'retry' },
    }),
    FinanceDeadLetter.count({
      where: { status: { [Op.in]: ['quarantined', 'replay_requested'] } },
    }),
    FinanceDeliveryLease.count({
      where: {
        status: 'active',
        lease_expires_at: { [Op.lt]: new Date() },
      },
    }),
    FinanceOutboxEvent.findOne({
      where: {
        ...where,
        status: { [Op.in]: ['pending', 'retry', 'publishing'] },
      },
      order: [['created_at', 'ASC']],
    }),
    FinanceDeliveryAttempt.findAll({
      attributes: ['duration_ms'],
      where: {
        status: 'delivered',
        completed_at: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      raw: true,
    }),
    FinanceConsumerOffset.findAll({
      where: { status: 'active' },
      raw: true,
    }),
  ]);

  const latencies = attempts
    .map((item) => Number(item.duration_ms))
    .filter(Number.isFinite);

  const avg =
    latencies.length
      ? latencies.reduce((sum, value) => sum + value, 0) / latencies.length
      : null;

  const oldestPendingAgeSeconds = oldestPending
    ? Math.max(
        0,
        Math.floor(
          (Date.now() - new Date(oldestPending.created_at).getTime()) / 1000
        )
      )
    : 0;

  const consumerLagSeconds = consumers.reduce(
    (max, item) => Math.max(max, Number(item.lag_seconds || 0)),
    0
  );

  const healthStatus =
    deadLetterCount > 0 ||
    staleLeaseCount > 0 ||
    oldestPendingAgeSeconds > 900 ||
    consumerLagSeconds > 900
      ? 'degraded'
      : 'healthy';

  const snapshot = await FinanceReliabilitySnapshot.create({
    snapshot_at: new Date(),
    source_system: sourceSystem,
    pending_count: pendingCount,
    published_count: publishedCount,
    failed_count: failedCount,
    dead_letter_count: deadLetterCount,
    oldest_pending_age_seconds: oldestPendingAgeSeconds,
    avg_delivery_latency_ms: avg,
    p95_delivery_latency_ms: percentile(latencies, 0.95),
    stale_lease_count: staleLeaseCount,
    consumer_lag_seconds: consumerLagSeconds,
    health_status: healthStatus,
  });

  if (healthStatus === 'degraded') {
    financeDeliveryEvents.emit(
      FINANCE_DELIVERY_EVENT.RELIABILITY_DEGRADED,
      { reliabilitySnapshotId: snapshot.id }
    );
  }

  return snapshot;
}

module.exports = {
  percentile,
  buildReliabilitySnapshot,
};
