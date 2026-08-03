const crypto = require('crypto');
const {
  IntercompanyTransaction,
} = require('../models/associations');

async function recordIntercompanyTransaction({
  sourceEntityId,
  counterpartyEntityId,
  transactionType,
  sourceTransactionId = null,
  counterpartyTransactionId = null,
  currency,
  amountMinor,
  transactionDate,
  metadata = {},
}) {
  if (String(sourceEntityId) === String(counterpartyEntityId)) {
    const error = new Error('Intercompany entities must differ');
    error.status = 422;
    throw error;
  }

  return IntercompanyTransaction.create({
    intercompany_reference:
      `IC-${Date.now()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
    source_entity_id: sourceEntityId,
    counterparty_entity_id: counterpartyEntityId,
    transaction_type: transactionType,
    source_transaction_id: sourceTransactionId,
    counterparty_transaction_id: counterpartyTransactionId,
    currency: String(currency).toUpperCase(),
    amount_minor: amountMinor,
    transaction_date: transactionDate,
    reconciliation_status:
      sourceTransactionId && counterpartyTransactionId ? 'matched' : 'unmatched',
    metadata,
  });
}

async function reconcileIntercompanyTransaction({
  intercompanyTransactionId,
  counterpartyTransactionId,
}) {
  const transaction = await IntercompanyTransaction.findByPk(
    intercompanyTransactionId
  );

  if (!transaction) {
    const error = new Error('Intercompany transaction not found');
    error.status = 404;
    throw error;
  }

  await transaction.update({
    counterparty_transaction_id: counterpartyTransactionId,
    reconciliation_status: 'matched',
    status: 'ready_for_elimination',
  });

  return transaction;
}

module.exports = {
  recordIntercompanyTransaction,
  reconcileIntercompanyTransaction,
};
