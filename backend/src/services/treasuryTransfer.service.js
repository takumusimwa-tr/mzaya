const crypto = require('crypto');
const { sequelize } = require('../config/db');
const { TreasuryTransfer } = require('../models/associations');
const {
  emitTreasuryTransferApproved,
  emitTreasuryTransferCompleted,
} = require('./treasuryFinanceEvents.service');

async function createTreasuryTransfer({
  transferType,
  sourceAccountId = null,
  destinationAccountId = null,
  currency,
  amountMinor,
  provider = null,
  initiatedBy,
  metadata = {},
}) {
  return TreasuryTransfer.create({
    transfer_reference: `TRF-${crypto.randomUUID().slice(0, 10).toUpperCase()}`,
    transfer_type: transferType,
    source_account_id: sourceAccountId,
    destination_account_id: destinationAccountId,
    currency: String(currency).toUpperCase(),
    amount_minor: amountMinor,
    provider,
    initiated_by: initiatedBy,
    metadata,
    status: 'draft',
  });
}

async function approveTreasuryTransfer({
  transferId,
  approvedBy,
}) {
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

    if (String(transfer.initiated_by) === String(approvedBy)) {
      const error = new Error('Transfer initiator cannot approve their own transfer');
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

    await emitTreasuryTransferApproved({
      transfer,
      transaction,
    });

    return transfer;
  });
}

async function confirmTreasuryTransferCompleted({
  transferId,
  providerReference,
}) {
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
      provider_reference: providerReference,
      completed_at: new Date(),
    }, { transaction });

    await emitTreasuryTransferCompleted({
      transfer,
      transaction,
    });

    return transfer;
  });
}

module.exports = {
  createTreasuryTransfer,
  approveTreasuryTransfer,
  confirmTreasuryTransferCompleted,
};
