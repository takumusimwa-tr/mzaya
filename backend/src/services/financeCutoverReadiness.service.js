const crypto = require('crypto');
const { Op } = require('sequelize');
const {
  FinanceCutoverReadinessCheck,
  FinanceDomainReconciliationSnapshot,
  FinanceDeadLetter,
  FinanceDeliveryLease,
  FinanceOutboxEvent,
  FinanceCrossDomainReconciliationRun,
} = require('../models/associations');

async function recordCheck({
  controlId,
  checkKey,
  name,
  passed,
  severity = 'error',
  measuredValue,
  thresholdValue,
  message,
}) {
  return FinanceCutoverReadinessCheck.create({
    check_reference:
      `CRC-${crypto.randomUUID().slice(0, 10).toUpperCase()}`,
    control_id: controlId,
    check_key: checkKey,
    name,
    result: passed ? 'passed' : 'failed',
    severity,
    measured_value: measuredValue,
    threshold_value: thresholdValue,
    message,
  });
}

async function evaluateCutoverReadiness(control) {
  const domainKey = control.domain_key;

  const latestSnapshot = domainKey
    ? await FinanceDomainReconciliationSnapshot.findOne({
        where: { domain_key: domainKey },
        order: [['snapshot_at', 'DESC']],
      })
    : null;

  const latestCrossDomainRun =
    await FinanceCrossDomainReconciliationRun.findOne({
      order: [['started_at', 'DESC']],
    });

  const [
    deadLetters,
    staleLeases,
    unpublishedOutbox,
  ] = await Promise.all([
    FinanceDeadLetter.count({
      where: { status: 'quarantined' },
    }),
    FinanceDeliveryLease.count({
      where: { status: 'active' },
    }),
    FinanceOutboxEvent.count({
      where: {
        status: {
          [Op.in]: ['pending', 'retry', 'dead_letter'],
        },
      },
    }),
  ]);

  const checks = [];

  if (latestSnapshot) {
    checks.push(await recordCheck({
      controlId: control.id,
      checkKey: 'domain_match_rate',
      name: 'Domain reconciliation match rate',
      passed: Number(latestSnapshot.match_rate || 0) >= 0.995,
      severity: 'critical',
      measuredValue: { matchRate: Number(latestSnapshot.match_rate || 0) },
      thresholdValue: { minimum: 0.995 },
      message: 'Domain match rate must be at least 99.5%.',
    }));

    checks.push(await recordCheck({
      controlId: control.id,
      checkKey: 'domain_blocking_exceptions',
      name: 'No domain reconciliation exceptions',
      passed: Number(latestSnapshot.exception_records || 0) === 0,
      severity: 'critical',
      measuredValue: { exceptions: Number(latestSnapshot.exception_records || 0) },
      thresholdValue: { maximum: 0 },
      message: 'Cutover requires zero unresolved domain reconciliation exceptions.',
    }));
  }

  checks.push(await recordCheck({
    controlId: control.id,
    checkKey: 'dead_letter_queue',
    name: 'Dead-letter queue empty',
    passed: deadLetters === 0,
    severity: 'critical',
    measuredValue: { deadLetters },
    thresholdValue: { maximum: 0 },
    message: 'Finance dead-letter queue must be empty before cutover.',
  }));

  checks.push(await recordCheck({
    controlId: control.id,
    checkKey: 'unpublished_outbox',
    name: 'No pending/retry outbox backlog',
    passed: unpublishedOutbox === 0,
    severity: 'critical',
    measuredValue: { unpublishedOutbox },
    thresholdValue: { maximum: 0 },
    message: 'Outbox backlog must be drained before cutover.',
  }));

  checks.push(await recordCheck({
    controlId: control.id,
    checkKey: 'cross_domain_blocking_exceptions',
    name: 'Cross-domain reconciliation clear',
    passed:
      latestCrossDomainRun &&
      Number(latestCrossDomainRun.blocking_exception_count || 0) === 0,
    severity: 'critical',
    measuredValue: {
      blockingExceptions:
        Number(latestCrossDomainRun?.blocking_exception_count || 0),
    },
    thresholdValue: { maximum: 0 },
    message: 'Latest cross-domain reconciliation must have zero blocking exceptions.',
  }));

  return {
    control,
    checks,
    ready: checks.every(
      (item) =>
        item.result === 'passed' ||
        !['error', 'critical'].includes(item.severity)
    ),
    advisory: {
      activeLeaseCount: staleLeases,
    },
  };
}

module.exports = {
  evaluateCutoverReadiness,
};
