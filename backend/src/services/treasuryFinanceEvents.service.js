const { enqueueFinanceOutboxEvent } = require('./financeOutbox.service');

function transferPayload(transfer) {
  const sourceAccountId =
    transfer.from_bank_account_id || transfer.source_account_id || null;
  const destinationAccountId =
    transfer.to_bank_account_id || transfer.destination_account_id || null;
  const currency =
    transfer.source_currency || transfer.currency || null;
  const amountMinor =
    transfer.source_amount_minor ?? transfer.amount_minor ?? 0;

  return {
    transferId: transfer.id,
    transferReference: transfer.transfer_reference,
    transferType: transfer.transfer_type,
    sourceAccountId,
    destinationAccountId,
    currency,
    amountMinor: Number(amountMinor),
    sourceCurrency: transfer.source_currency || currency,
    destinationCurrency: transfer.destination_currency || currency,
    sourceAmountMinor: Number(transfer.source_amount_minor ?? amountMinor),
    destinationAmountMinor: Number(transfer.destination_amount_minor ?? amountMinor),
    fxRateId: transfer.fx_rate_id || null,
    provider: transfer.provider || transfer.metadata?.provider || null,
    providerReference:
      transfer.provider_reference ||
      transfer.metadata?.providerReference ||
      null,
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
