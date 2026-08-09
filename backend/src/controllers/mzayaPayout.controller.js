const {
  MzayaPayout,
  MzayaPayoutFinanceReconciliationResult,
} = require('../models/associations');
const {
  createMzayaPayout,
  approveMzayaPayout,
  markMzayaPayoutPaid,
} = require('../services/mzayaPayout.service');
const {
  reconcileMzayaPayout,
} = require('../services/mzayaPayoutReconciliation.service');

async function list(req, res, next) {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.mzayaId) where.mzaya_id = req.query.mzayaId;

    const payouts = await MzayaPayout.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 100, 300),
    });

    return res.status(200).json({ payouts });
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const payout = await createMzayaPayout(req.body);
    return res.status(201).json({ payout });
  } catch (error) {
    return next(error);
  }
}

async function approve(req, res, next) {
  try {
    const payout = await approveMzayaPayout({
      payoutId: req.params.payoutId,
      approvedBy: req.user.id,
    });

    return res.status(200).json({ payout });
  } catch (error) {
    return next(error);
  }
}

async function markPaid(req, res, next) {
  try {
    const payout = await markMzayaPayoutPaid({
      payoutId: req.params.payoutId,
      amountPaidMinor: req.body.amountPaidMinor,
      provider: req.body.provider,
      providerReference: req.body.providerReference,
      paidBy: req.user.id,
    });

    return res.status(200).json({ payout });
  } catch (error) {
    return next(error);
  }
}

async function reconciliationList(req, res, next) {
  try {
    const results =
      await MzayaPayoutFinanceReconciliationResult.findAll({
        order: [['evaluated_at', 'DESC']],
        limit: Math.min(Number(req.query.limit) || 100, 300),
      });

    return res.status(200).json({ results });
  } catch (error) {
    return next(error);
  }
}

async function reconcile(req, res, next) {
  try {
    const result = await reconcileMzayaPayout(
      req.params.payoutId
    );

    return res.status(200).json({ result });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  list,
  create,
  approve,
  markPaid,
  reconciliationList,
  reconcile,
};
