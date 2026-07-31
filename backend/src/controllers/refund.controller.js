const {
  requestRefund,
  approveRefund,
  completeRefund,
} = require('../services/refund.service');

async function request(req, res, next) {
  try {
    const refund = await requestRefund({
      paymentId: req.body.paymentId,
      requesterId: req.user.id,
      amountMinor: req.body.amountMinor,
      reason: req.body.reason,
      notes: req.body.notes,
    });
    return res.status(201).json({ refund });
  } catch (error) {
    return next(error);
  }
}

async function approve(req, res, next) {
  try {
    const refund = await approveRefund({
      refundId: req.params.refundId,
      approverId: req.user.id,
      notes: req.body.notes,
    });
    return res.status(200).json({ refund });
  } catch (error) {
    return next(error);
  }
}

async function complete(req, res, next) {
  try {
    const refund = await completeRefund({
      refundId: req.params.refundId,
      provider: req.body.provider,
      providerReference: req.body.providerReference,
      providerPayload: req.body.providerPayload,
      allocations: req.body.allocations,
      actorId: req.user.id,
    });
    return res.status(200).json({ refund });
  } catch (error) {
    return next(error);
  }
}

module.exports = { request, approve, complete };
