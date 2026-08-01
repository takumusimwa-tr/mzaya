const { sequelize } = require('../config/db');
const {
  TreasuryTransfer,
  TreasuryTransferAttempt,
  BankAccount,
} = require('../models/associations');
const {
  submitTreasuryTransfer,
} = require('./treasuryTransferGateway.service');
const {
  recordTreasuryTransferAudit,
} = require('./treasuryTransferAudit.service');
const {
  treasuryExecutionEvents,
  TREASURY_EXECUTION_EVENT,
} = require('../events/treasuryExecution.events');

function serviceError(message, status = 400, code = 'TREASURY_TRANSFER_ERROR') {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

async function approveTreasuryTransfer({
  transferId,
  approverId,
}) {
  const transfer = await TreasuryTransfer.findByPk(transferId);

  if (!transfer) {
    throw serviceError('Treasury transfer not found', 404, 'TRANSFER_NOT_FOUND');
  }

  if (transfer.status !== 'draft') {
    throw serviceError('Only draft transfers can be approved', 409, 'INVALID_TRANSFER_STATUS');
  }

  if (String(transfer.requested_by) === String(approverId)) {
    throw serviceError(
      'Requester cannot approve the same treasury transfer',
      403,
      'MAKER_CHECKER_VIOLATION'
    );
  }

  await transfer.update({
    status: 'approved',
    approved_by: approverId,
    approved_at: new Date(),
  });

  await recordTreasuryTransferAudit({
    transferId,
    actorId: approverId,
    action: 'transfer_approved',
    previousValue: { status: 'draft' },
    newValue: { status: 'approved' },
  });

  treasuryExecutionEvents.emit(
    TREASURY_EXECUTION_EVENT.TRANSFER_APPROVED,
    { transferId }
  );

  return transfer;
}

async function executeTreasuryTransfer({
  transferId,
  actorId,
}) {
  return sequelize.transaction(async (transaction) => {
    const transfer = await TreasuryTransfer.findByPk(transferId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!transfer) {
      throw serviceError('Treasury transfer not found', 404, 'TRANSFER_NOT_FOUND');
    }

    if (transfer.status !== 'approved') {
      throw serviceError(
        'Treasury transfer must be approved before execution',
        409,
        'TRANSFER_NOT_APPROVED'
      );
    }

    const [fromAccount, toAccount] = await Promise.all([
      BankAccount.findByPk(transfer.from_bank_account_id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      }),
      BankAccount.findByPk(transfer.to_bank_account_id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      }),
    ]);

    if (Number(fromAccount.available_balance_minor) < Number(transfer.source_amount_minor)) {
      throw serviceError(
        'Available balance is no longer sufficient',
        409,
        'INSUFFICIENT_TREASURY_BALANCE'
      );
    }

    const attemptNumber = await TreasuryTransferAttempt.count({
      where: { treasury_transfer_id: transfer.id },
      transaction,
    }) + 1;

    const attempt = await TreasuryTransferAttempt.create({
      treasury_transfer_id: transfer.id,
      attempt_number: attemptNumber,
      status: 'processing',
      request_payload: {
        transferReference: transfer.transfer_reference,
        sourceAmountMinor: transfer.source_amount_minor,
        destinationAmountMinor: transfer.destination_amount_minor,
      },
    }, { transaction });

    await transfer.update({ status: 'processing' }, { transaction });

    try {
      const result = await submitTreasuryTransfer({
        transfer,
        fromAccount,
        toAccount,
      });

      if (result.skipped) {
        await attempt.update({
          status: 'skipped',
          provider: result.provider,
          response_payload: result.payload,
          completed_at: new Date(),
        }, { transaction });

        await transfer.update({ status: 'approved' }, { transaction });
        return transfer;
      }

      await fromAccount.update({
        current_balance_minor:
          Number(fromAccount.current_balance_minor) -
          Number(transfer.source_amount_minor),
        available_balance_minor:
          Number(fromAccount.available_balance_minor) -
          Number(transfer.source_amount_minor),
      }, { transaction });

      await toAccount.update({
        current_balance_minor:
          Number(toAccount.current_balance_minor) +
          Number(transfer.destination_amount_minor),
        available_balance_minor:
          Number(toAccount.available_balance_minor) +
          Number(transfer.destination_amount_minor),
      }, { transaction });

      await attempt.update({
        status: 'completed',
        provider: result.provider,
        provider_reference: result.providerReference,
        response_payload: result.payload || {},
        completed_at: new Date(),
      }, { transaction });

      await transfer.update({
        status: 'completed',
        completed_at: new Date(),
        metadata: {
          ...(transfer.metadata || {}),
          provider: result.provider,
          providerReference: result.providerReference,
        },
      }, { transaction });

      await recordTreasuryTransferAudit({
        transferId,
        actorId,
        action: 'transfer_completed',
        newValue: {
          provider: result.provider,
          providerReference: result.providerReference,
        },
        transaction,
      });

      transaction.afterCommit(() => {
        treasuryExecutionEvents.emit(
          TREASURY_EXECUTION_EVENT.TRANSFER_COMPLETED,
          { transferId }
        );
      });

      return transfer;
    } catch (error) {
      await attempt.update({
        status: 'failed',
        error_message: String(error.message || error).slice(0, 1000),
        completed_at: new Date(),
      }, { transaction });

      await transfer.update({
        status: 'failed',
        failure_reason: String(error.message || error).slice(0, 1000),
      }, { transaction });

      throw error;
    }
  });
}

module.exports = {
  approveTreasuryTransfer,
  executeTreasuryTransfer,
};
