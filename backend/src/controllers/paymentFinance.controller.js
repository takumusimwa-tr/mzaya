const {
  PaymentFinanceReconciliationResult,
} = require('../models/associations');
const {
  reconcilePayment,
} = require('../services/paymentAccountingReconciliation.service');
const {
  requestRefund,
  markRefundCompleted,
} = require('../services/paymentRefund.service');

async function reconciliationList(req, res, next) {
  try {
    const results = await PaymentFinanceReconciliationResult.findAll({
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
    const result = await reconcilePayment(req.params.paymentId);
    return res.status(200).json({ result });
  } catch (error) {
    return next(error);
  }
}

async function refund(req, res, next) {
  try {
    const result = await requestRefund({
      paymentId: req.params.paymentId,
      amountMinor: req.body.amountMinor,
      reason: req.body.reason,
      requestedBy: req.user.id,
    });

    return res.status(201).json({ refund: result });
  } catch (error) {
    return next(error);
  }
}

async function completeRefund(req, res, next) {
  try {
    const refund = await markRefundCompleted({
      refundId: req.params.refundId,
      providerRefundReference: req.body.providerRefundReference,
    });

    return res.status(200).json({ refund });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  reconciliationList,
  reconcile,
  refund,
  completeRefund,
};
