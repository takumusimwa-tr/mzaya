const crypto = require('crypto');
const { sequelize } = require('../config/db');
const { TreasuryTransfer } = require('../models/associations');
const {
  emitTreasuryTransferApproved,
  emitTreasuryTransferCompleted,
} = require('./treasuryFinanceEvents.service');

function normalizeCurrency(value) {
  if (!value) return null;
  return String(value).toUpperCase();
}

async function createTreasuryTransfer({
  transferType,
  // Existing public API names are preserved.
  sourceAccountId = null,
  destinationAccountId = null,
  currency = null,
  amountMinor = null,
  provider = null,
  initiatedBy = null,
  requestedBy = null,

  // Canonical bank/FX inputs may be supplied directly by newer callers.
  fromBankAccountId = null,
  toBankAccountId = null,
  sourceCurrency = null,
  destinationCurrency = null,
  sourceAmountMinor = null,
  destinationAmountMinor = null,
  fxRateId = null,
  metadata = {},
}) {
  const requesterId = requestedBy || initiatedBy || null;
  const fromId = fromBankAccountId || sourceAccountId || null;
  const toId = toBankAccountId || destinationAccountId || null;
  const sourceCcy = normalizeCurrency(sourceCurrency || currency);
  const destinationCcy = normalizeCurrency(destinationCurrency || currency);
  const sourceAmount = sourceAmountMinor ?? amountMinor ?? null;
  const destinationAmount = destinationAmountMinor ?? amountMinor ?? null;

  if (!transferType) {
    const error = new Error('Treasury transfer type is required');
    error.status = 400;
    error.code = 'TREASURY_TRANSFER_TYPE_REQUIRED';
    throw error;
  }

  if (!sourceCcy || sourceAmount == null || Number(sourceAmount) <= 0) {
    const error = new Error('Treasury transfer requires a valid source currency and positive amount');
    error.status = 400;
    error.code = 'INVALID_TREASURY_TRANSFER_AMOUNT';
    throw error;
  }

  return TreasuryTransfer.create({
    transfer_reference: `TRF-${crypto.randomUUID().slice(0, 10).toUpperCase()}`,
    transfer_type: transferType,

    from_bank_account_id: fromId,
    to_bank_account_id: toId,
    source_currency: sourceCcy,
    destination_currency: destinationCcy,
    source_amount_minor: sourceAmount,
    destination_amount_minor: destinationAmount,
    fx_rate_id: fxRateId,
    requested_by: requesterId,

    // Compatibility projection for finance integrations that still consume the
    // 08.5.6 field names.
    source_account_id: sourceAccountId || fromId,
    destination_account_id: destinationAccountId || toId,
    currency: sourceCcy,
    amount_minor: sourceAmount,
    provider,
    initiated_by: initiatedBy || requesterId,

    metadata,
    status: 'draft',
  });
}

async function approveTreasuryTransfer({ transferId, approvedBy }) {
  return sequelize.transaction(async (transaction) => {
    const transfer = await TreasuryTransfer.findByPk(transferId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!transfer) {
      const error = new Error('Treasury transfer not found');
      error.status = 404;
      throw error;
    }

    const requesterId = transfer.requested_by || transfer.initiated_by;
    if (requesterId && String(requesterId) === String(approvedBy)) {
      const error = new Error('Transfer requester cannot approve their own transfer');
      error.status = 403;
      error.code = 'MAKER_CHECKER_VIOLATION';
      throw error;
    }

    if (transfer.status === 'approved') return transfer;
    if (transfer.status !== 'draft') {
      const error = new Error('Only draft transfers can be approved');
      error.status = 409;
      throw error;
    }

    await transfer.update({
      status: 'approved',
      approved_by: approvedBy,
      approved_at: new Date(),
    }, { transaction });

    // Finance emission is durable accounting integration only. It does not call
    // the treasury provider gateway or move money.
    await emitTreasuryTransferApproved({ transfer, transaction });
    return transfer;
  });
}

async function confirmTreasuryTransferCompleted({ transferId, providerReference }) {
  return sequelize.transaction(async (transaction) => {
    const transfer = await TreasuryTransfer.findByPk(transferId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!transfer) {
      const error = new Error('Treasury transfer not found');
      error.status = 404;
      throw error;
    }

    if (transfer.status === 'completed') return transfer;
    if (transfer.status !== 'approved') {
      const error = new Error('Transfer must be approved before completion');
      error.status = 409;
      throw error;
    }

    await transfer.update({
      status: 'completed',
      provider_reference: providerReference || null,
      completed_at: new Date(),
      metadata: {
        ...(transfer.metadata || {}),
        ...(providerReference ? { providerReference } : {}),
      },
    }, { transaction });

    await emitTreasuryTransferCompleted({ transfer, transaction });
    return transfer;
  });
}

module.exports = {
  createTreasuryTransfer,
  approveTreasuryTransfer,
  confirmTreasuryTransferCompleted,
};
