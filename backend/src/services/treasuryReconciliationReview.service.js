const {
  BankTransaction,
  TreasuryReconciliationCandidate,
  TreasuryReconciliationReview,
} = require('../models/associations');
const {
  reconcileBankTransaction,
} = require('./treasuryReconciliation.service');
const {
  treasuryReconciliationEvents,
  TREASURY_RECONCILIATION_EVENT,
} = require('../events/treasuryReconciliation.events');

async function acceptCandidate({
  candidateId,
  reviewedBy,
  notes = null,
}) {
  const candidate = await TreasuryReconciliationCandidate.findByPk(candidateId);

  if (!candidate) {
    const error = new Error('Reconciliation candidate not found');
    error.status = 404;
    throw error;
  }

  const bankTransaction = await BankTransaction.findByPk(
    candidate.bank_transaction_id
  );

  const reconciliation = await reconcileBankTransaction({
    bankTransactionId: candidate.bank_transaction_id,
    ledgerTransactionId: candidate.ledger_transaction_id,
    matchedBy: reviewedBy,
    notes,
  });

  await candidate.update({ status: 'accepted' });

  await TreasuryReconciliationCandidate.update({
    status: 'rejected',
  }, {
    where: {
      bank_transaction_id: candidate.bank_transaction_id,
      id: { [require('sequelize').Op.ne]: candidate.id },
      status: 'candidate',
    },
  });

  await TreasuryReconciliationReview.create({
    bank_transaction_id: candidate.bank_transaction_id,
    reconciliation_id: reconciliation.id,
    reviewed_by: reviewedBy,
    action: 'candidate_accepted',
    notes,
    previous_status: bankTransaction.reconciliation_status,
    new_status: reconciliation.status,
    metadata: {
      candidateId,
      score: candidate.score,
    },
  });

  treasuryReconciliationEvents.emit(
    TREASURY_RECONCILIATION_EVENT.MATCH_CONFIRMED,
    {
      bankTransactionId: candidate.bank_transaction_id,
      reconciliationId: reconciliation.id,
      automated: false,
    }
  );

  return reconciliation;
}

async function rejectCandidate({
  candidateId,
  reviewedBy,
  notes = null,
}) {
  const candidate = await TreasuryReconciliationCandidate.findByPk(candidateId);

  if (!candidate) {
    const error = new Error('Reconciliation candidate not found');
    error.status = 404;
    throw error;
  }

  await candidate.update({ status: 'rejected' });

  await TreasuryReconciliationReview.create({
    bank_transaction_id: candidate.bank_transaction_id,
    reviewed_by: reviewedBy,
    action: 'candidate_rejected',
    notes,
    metadata: {
      candidateId,
      score: candidate.score,
    },
  });

  treasuryReconciliationEvents.emit(
    TREASURY_RECONCILIATION_EVENT.MATCH_REJECTED,
    {
      bankTransactionId: candidate.bank_transaction_id,
      candidateId,
    }
  );

  return candidate;
}

module.exports = {
  acceptCandidate,
  rejectCandidate,
};
