const { enqueueFinanceOutboxEvent } = require('./financeOutbox.service');

function transferPayload(transfer) {
  return {
    transferId: transfer.id,
    transferReference: transfer.transfer_reference,
    transferType: transfer.transfer_type,
    sourceAccountId: transfer.source_account_id || null,
    destinationAccountId: transfer.destination_account_id || null,
    currency: transfer.currency,
    amountMinor: Number(transfer.amount_minor || 0),
    provider: transfer.provider || null,
    providerReference: transfer.provider_reference || null,
  };
}

async function emitTreasuryTransferApproved({ transfer, transaction }) {
  return enqueueFinanceOutboxEvent({
    transaction,
    aggregateType: 'treasury_transfer',
    aggregateId: transfer.id,
    eventType: 'treasury.transfer_approved',
    sourceSystem: 'treasury',
    payload: transferPayload(transfer),
    idempotencyKey: `treasury_transfer:${transfer.id}:approved:v1`,
  });
}

async function emitTreasuryTransferCompleted({ transfer, transaction }) {
  return enqueueFinanceOutboxEvent({
    transaction,
    aggregateType: 'treasury_transfer',
    aggregateId: transfer.id,
    eventType: 'treasury.transfer_completed',
    sourceSystem: 'treasury',
    payload: transferPayload(transfer),
    idempotencyKey: `treasury_transfer:${transfer.id}:completed:v1`,
  });
}

module.exports = {
  transferPayload,
  emitTreasuryTransferApproved,
  emitTreasuryTransferCompleted,
};
