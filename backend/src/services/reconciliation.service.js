const { Op } = require('sequelize');
const {
  PaymentReconciliationRecord,
  LedgerTransaction,
} = require('../models/associations');

function determineStatus(providerAmount, internalAmount) {
  if (internalAmount == null) return 'unmatched';
  if (Number(providerAmount) === Number(internalAmount)) return 'matched';
  return 'discrepancy';
}

async function ingestReconciliationRecord({
  provider,
  providerReference,
  internalReference = null,
  recordType,
  currency,
  providerAmountMinor,
  providerPayload = {},
}) {
  let internalAmountMinor = null;

  if (internalReference) {
    const transaction = await LedgerTransaction.findOne({
      where: { reference: internalReference },
      include: ['entries'],
    });

    if (transaction) {
      internalAmountMinor = transaction.entries
        .filter((entry) => entry.direction === 'debit')
        .reduce((sum, entry) => sum + Number(entry.amount_minor), 0);
    }
  }

  const status = determineStatus(
    providerAmountMinor,
    internalAmountMinor
  );

  const [record] = await PaymentReconciliationRecord.upsert({
    provider,
    provider_reference: providerReference,
    internal_reference: internalReference,
    record_type: recordType,
    currency: String(currency).toUpperCase(),
    provider_amount_minor: providerAmountMinor,
    internal_amount_minor: internalAmountMinor,
    discrepancy_minor: internalAmountMinor == null
      ? null
      : Number(providerAmountMinor) - Number(internalAmountMinor),
    reconciliation_status: status,
    provider_payload: providerPayload,
    reconciled_at: status === 'matched' ? new Date() : null,
  }, { returning: true });

  return record;
}

async function listReconciliationExceptions({
  status = ['unmatched', 'discrepancy'],
  limit = 50,
}) {
  return PaymentReconciliationRecord.findAll({
    where: {
      reconciliation_status: {
        [Op.in]: Array.isArray(status) ? status : [status],
      },
    },
    order: [['created_at', 'ASC']],
    limit: Math.min(Number(limit) || 50, 200),
  });
}

module.exports = {
  determineStatus,
  ingestReconciliationRecord,
  listReconciliationExceptions,
};
