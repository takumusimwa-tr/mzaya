const {
  dispatchOrder,
  respondToOffer,
} = require('../services/dispatch.service');

async function startDispatch(req, res, next) {
  try {
    const offer = await dispatchOrder(req.params.orderId);
    return res.status(201).json({
      message: 'Dispatch offer created',
      offer,
    });
  } catch (error) {
    return next(error);
  }
}

async function respond(req, res, next) {
  try {
    const result = await respondToOffer({
      offerId: req.params.offerId,
      riderUserId: req.user.id,
      accept: req.body.accept,
      declineReason: req.body.decline_reason,
    });

    return res.status(200).json({
      message: result.accepted ? 'Order accepted' : 'Offer declined',
      ...result,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { startDispatch, respond };
