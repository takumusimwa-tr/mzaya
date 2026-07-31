const crypto = require('crypto');
const { Op, fn, col, literal } = require('sequelize');
const { sequelize } = require('../config/db');
const {
  LedgerTransaction,
  LedgerEntry,
} = require('../models/associations');
const {
  assertPositiveMinorUnits,
} = require('../utils/money');

function serviceError(message, status = 400, code = 'LEDGER_ERROR') {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function validateBalancedEntries(entries) {
  if (!Array.isArray(entries) || entries.length < 2) {
    throw serviceError(
      'A ledger transaction requires at least two entries',
      422,
      'LEDGER_ENTRIES_REQUIRED'
    );
  }

  let debits = 0;
  let credits = 0;

  for (const entry of entries) {
    const amount = assertPositiveMinorUnits(entry.amountMinor);

    if (entry.direction === 'debit') debits += amount;
    else if (entry.direction === 'credit') credits += amount;
    else {
      throw serviceError(
        'Ledger direction must be debit or credit',
        422,
        'INVALID_LEDGER_DIRECTION'
      );
    }
  }

  if (debits !== credits) {
    throw serviceError(
      'Ledger transaction is not balanced',
      422,
      'UNBALANCED_LEDGER_TRANSACTION'
    );
  }

  return { debits, credits };
}

async function postLedgerTransaction({
  reference,
  transactionType,
  currency,
  entries,
  orderId = null,
  paymentId = null,
  description = null,
  metadata = {},
  createdBy = null,
  externalTransaction = null,
}) {
  validateBalancedEntries(entries);

  const execute = async (transaction) => {
    const existing = await LedgerTransaction.findOne({
      where: { reference },
      include: [{ model: LedgerEntry, as: 'entries' }],
      transaction,
    });

    if (existing) return existing;

    const ledgerTransaction = await LedgerTransaction.create({
      reference,
      transaction_type: transactionType,
      currency: String(currency).toUpperCase(),
      order_id: orderId,
      payment_id: paymentId,
      description,
      metadata,
      created_by: createdBy,
    }, { transaction });

    await LedgerEntry.bulkCreate(
      entries.map((entry) => ({
        transaction_id: ledgerTransaction.id,
        account_id: entry.accountId,
        direction: entry.direction,
        amount_minor: entry.amountMinor,
        metadata: entry.metadata || {},
      })),
      { transaction }
    );

    return LedgerTransaction.findByPk(ledgerTransaction.id, {
      include: [{ model: LedgerEntry, as: 'entries' }],
      transaction,
    });
  };

  if (externalTransaction) return execute(externalTransaction);
  return sequelize.transaction(execute);
}

async function reverseLedgerTransaction({
  transactionId,
  reason,
  createdBy,
}) {
  return sequelize.transaction(async (transaction) => {
    const original = await LedgerTransaction.findByPk(transactionId, {
      include: [{ model: LedgerEntry, as: 'entries' }],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!original) {
      throw serviceError('Ledger transaction not found', 404, 'LEDGER_NOT_FOUND');
    }

    if (original.reversed_by_transaction_id) {
      return LedgerTransaction.findByPk(original.reversed_by_transaction_id, {
        include: [{ model: LedgerEntry, as: 'entries' }],
        transaction,
      });
    }

    const reversal = await postLedgerTransaction({
      reference: `REV-${original.reference}`,
      transactionType: 'reversal',
      currency: original.currency,
      orderId: original.order_id,
      paymentId: original.payment_id,
      description: reason || `Reversal of ${original.reference}`,
      metadata: {
        reversedTransactionId: original.id,
      },
      createdBy,
      entries: original.entries.map((entry) => ({
        accountId: entry.account_id,
        direction: entry.direction === 'debit' ? 'credit' : 'debit',
        amountMinor: Number(entry.amount_minor),
      })),
      externalTransaction: transaction,
    });

    await original.update({
      reversed_by_transaction_id: reversal.id,
    }, { transaction });

    return reversal;
  });
}

async function getAccountBalance(accountId) {
  const result = await LedgerEntry.findOne({
    where: { account_id: accountId },
    attributes: [[literal(`
      COALESCE(SUM(
        CASE
          WHEN direction = 'credit' THEN amount_minor
          ELSE -amount_minor
        END
      ), 0)
    `), 'balance_minor']],
    raw: true,
  });

  return Number(result?.balance_minor || 0);
}

module.exports = {
  validateBalancedEntries,
  postLedgerTransaction,
  reverseLedgerTransaction,
  getAccountBalance,
};
