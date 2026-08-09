const {
  enqueueFinanceOutboxEvent,
} = require('./financeOutbox.service');

function taxPayload(taxTransaction) {
  return {
    taxTransactionId: taxTransaction.id,
    taxReference: taxTransaction.tax_reference,
    sourceType: taxTransaction.source_type,
    sourceId: taxTransaction.source_id || null,
    sourceEventType: taxTransaction.source_event_type || null,
    jurisdictionCode: taxTransaction.jurisdiction_code || null,
    taxCode: taxTransaction.tax_code,
    taxType: taxTransaction.tax_type,
    currency: taxTransaction.currency,
    taxableBaseMinor: Number(taxTransaction.taxable_base_minor || 0),
    taxRateBps: taxTransaction.tax_rate_bps,
    taxAmountMinor: Number(taxTransaction.tax_amount_minor || 0),
    taxInclusive: Boolean(taxTransaction.tax_inclusive),
    direction: taxTransaction.direction,
  };
}

async function emitTaxLiabilityCreated({
  taxTransaction,
  transaction,
}) {
  return enqueueFinanceOutboxEvent({
    transaction,
    aggregateType: 'tax_transaction',
    aggregateId: taxTransaction.id,
    eventType: 'tax.liability_created',
    sourceSystem: 'tax',
    payload: taxPayload(taxTransaction),
    idempotencyKey:
      `tax_transaction:${taxTransaction.id}:liability_created:v1`,
  });
}

async function emitTaxReversed({
  taxTransaction,
  transaction,
}) {
  return enqueueFinanceOutboxEvent({
    transaction,
    aggregateType: 'tax_transaction',
    aggregateId: taxTransaction.id,
    eventType: 'tax.liability_reversed',
    sourceSystem: 'tax',
    payload: taxPayload(taxTransaction),
    idempotencyKey:
      `tax_transaction:${taxTransaction.id}:reversed:v1`,
  });
}

module.exports = {
  taxPayload,
  emitTaxLiabilityCreated,
  emitTaxReversed,
};
