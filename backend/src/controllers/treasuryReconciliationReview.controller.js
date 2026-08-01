const {
  TreasuryReconciliationCandidate,
} = require('../models/associations');
const {
  acceptCandidate,
  rejectCandidate,
} = require('../services/treasuryReconciliationReview.service');

async function candidates(req, res, next) {
  try {
    const items = await TreasuryReconciliationCandidate.findAll({
      where: {
        bank_transaction_id: req.params.bankTransactionId,
        status: 'candidate',
      },
      order: [['score', 'DESC']],
      limit: 20,
    });

    return res.status(200).json({ candidates: items });
  } catch (error) {
    return next(error);
  }
}

async function accept(req, res, next) {
  try {
    const reconciliation = await acceptCandidate({
      candidateId: req.params.candidateId,
      reviewedBy: req.user.id,
      notes: req.body.notes,
    });

    return res.status(200).json({ reconciliation });
  } catch (error) {
    return next(error);
  }
}

async function reject(req, res, next) {
  try {
    const candidate = await rejectCandidate({
      candidateId: req.params.candidateId,
      reviewedBy: req.user.id,
      notes: req.body.notes,
    });

    return res.status(200).json({ candidate });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  candidates,
  accept,
  reject,
};
