const crypto = require('crypto');
const {
  ReconciliationRun,
} = require('../models/associations');
const {
  ingestReconciliationRecord,
} = require('./reconciliation.service');
const {
  providerWebhookEvents,
  PROVIDER_WEBHOOK_EVENT,
} = require('../events/providerWebhook.events');

function buildRunReference(provider, statementDate) {
  return [
    String(provider).toUpperCase(),
    statementDate || 'ADHOC',
    crypto.randomUUID().slice(0, 8).toUpperCase(),
  ].join('-');
}

/**
 * Provider statement adapter contract:
 * adapter.fetchStatement({ statementDate }) -> array of normalized records.
 */
async function runAutomatedReconciliation({
  provider,
  statementDate,
  adapter,
}) {
  const run = await ReconciliationRun.create({
    provider,
    run_reference: buildRunReference(provider, statementDate),
    statement_date: statementDate || null,
    status: 'processing',
    started_at: new Date(),
  });

  try {
    const records = await adapter.fetchStatement({ statementDate });

    let matched = 0;
    let unmatched = 0;
    let discrepancy = 0;

    for (const record of records) {
      const reconciled = await ingestReconciliationRecord({
        provider,
        providerReference: record.providerReference,
        internalReference: record.internalReference,
        recordType: record.recordType,
        currency: record.currency,
        providerAmountMinor: record.amountMinor,
        providerPayload: record.payload || record,
      });

      if (reconciled.reconciliation_status === 'matched') matched += 1;
      if (reconciled.reconciliation_status === 'unmatched') unmatched += 1;
      if (reconciled.reconciliation_status === 'discrepancy') discrepancy += 1;
    }

    await run.update({
      status: 'completed',
      record_count: records.length,
      matched_count: matched,
      unmatched_count: unmatched,
      discrepancy_count: discrepancy,
      completed_at: new Date(),
    });

    providerWebhookEvents.emit(
      PROVIDER_WEBHOOK_EVENT.RECONCILIATION_COMPLETED,
      {
        reconciliationRunId: run.id,
        provider,
        recordCount: records.length,
        matched,
        unmatched,
        discrepancy,
      }
    );

    return run;
  } catch (error) {
    await run.update({
      status: 'failed',
      failed_at: new Date(),
      error_message: String(error.message || error).slice(0, 1000),
    });

    throw error;
  }
}

module.exports = {
  buildRunReference,
  runAutomatedReconciliation,
};
