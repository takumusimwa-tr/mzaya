const crypto = require('crypto');
const {
  FinanceCrossDomainReconciliationRun,
  FinanceCrossDomainReconciliationException,
  FinanceDomainReconciliationSnapshot,
  FinanceOutboxEvent,
  FinanceBusinessEvent,
  FinanceAccountingEvent,
} = require('../models/associations');
const {
  buildAllDomainSnapshots,
} = require('./financeDomainReconciliation.service');

async function createException({
  runId,
  domainKey,
  exceptionCode,
  severity,
  message,
  evidence = {},
  sourceRecordId = null,
}) {
  return FinanceCrossDomainReconciliationException.create({
    run_id: runId,
    domain_key: domainKey,
    exception_code: exceptionCode,
    severity,
    source_record_id: sourceRecordId,
    message,
    evidence,
  });
}

async function runCrossDomainReconciliation({
  initiatedBy = null,
} = {}) {
  const run = await FinanceCrossDomainReconciliationRun.create({
    run_reference:
      `CDR-${crypto.randomUUID().slice(0, 10).toUpperCase()}`,
    initiated_by: initiatedBy,
    status: 'running',
  });

  const snapshots = await buildAllDomainSnapshots();
  let exceptions = [];

  for (const snapshot of snapshots) {
    if (Number(snapshot.exception_records || 0) > 0) {
      exceptions.push(await createException({
        runId: run.id,
        domainKey: snapshot.domain_key,
        exceptionCode: 'DOMAIN_RECONCILIATION_EXCEPTIONS',
        severity: 'error',
        message:
          `${snapshot.domain_key} has ${snapshot.exception_records} reconciliation exceptions.`,
        evidence: snapshot.toJSON(),
      }));
    }

    if (Number(snapshot.stale_records || 0) > 0) {
      exceptions.push(await createException({
        runId: run.id,
        domainKey: snapshot.domain_key,
        exceptionCode: 'STALE_RECONCILIATION_RECORDS',
        severity: 'warning',
        message:
          `${snapshot.domain_key} has ${snapshot.stale_records} stale reconciliation records.`,
        evidence: snapshot.toJSON(),
      }));
    }
  }

  const [publishedOutbox, financeEvents, accountingEvents] = await Promise.all([
    FinanceOutboxEvent.count({ where: { status: 'published' } }),
    FinanceBusinessEvent.count(),
    FinanceAccountingEvent.count(),
  ]);

  if (publishedOutbox > financeEvents) {
    exceptions.push(await createException({
      runId: run.id,
      domainKey: 'event_pipeline',
      exceptionCode: 'PUBLISHED_OUTBOX_EXCEEDS_FINANCE_EVENTS',
      severity: 'critical',
      message:
        'Published outbox events exceed accepted finance business events.',
      evidence: { publishedOutbox, financeEvents },
    }));
  }

  if (financeEvents > accountingEvents) {
    exceptions.push(await createException({
      runId: run.id,
      domainKey: 'event_pipeline',
      exceptionCode: 'FINANCE_EVENTS_EXCEED_ACCOUNTING_EVENTS',
      severity: 'error',
      message:
        'Finance business events exceed prepared accounting events.',
      evidence: { financeEvents, accountingEvents },
    }));
  }

  const blocking = exceptions.filter(
    (item) => ['error', 'critical'].includes(item.severity)
  ).length;

  await run.update({
    completed_at: new Date(),
    status: blocking ? 'exceptions' : 'completed',
    domain_count: snapshots.length,
    exception_count: exceptions.length,
    blocking_exception_count: blocking,
    summary: {
      domains: snapshots.map((item) => ({
        domainKey: item.domain_key,
        matchRate: Number(item.match_rate || 0),
        exceptions: item.exception_records,
        stale: item.stale_records,
        health: item.health_status,
      })),
      eventPipeline: {
        publishedOutbox,
        financeEvents,
        accountingEvents,
      },
    },
  });

  return {
    run,
    snapshots,
    exceptions,
  };
}

module.exports = {
  runCrossDomainReconciliation,
};
