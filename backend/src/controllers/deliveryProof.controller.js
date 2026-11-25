const {
  submitDeliveryProof,
} = require('../services/deliveryProof.service');
const { sendServiceError } = require('../utils/serviceError');
const { DeliveryProof, OrderTimeline } = require('../models/associations');

async function submit(req, res, next) {
  try {
    const result = await submitDeliveryProof({
      orderId: req.params.orderId,
      riderUserId: req.user.id,
      proofType: req.body.proof_type,
      recipientName: req.body.recipient_name,
      recipientPhone: req.body.recipient_phone,
      otpVerified: req.body.otp_verified,
      photoUrl: req.body.photo_url,
      signatureUrl: req.body.signature_url,
      notes: req.body.notes,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
    });

    return res.status(result.replayed ? 200 : 201).json({
      message: 'Delivery completed',
      order: { id: result.order.id, status: result.order.status },
      proof: result.proof,
    });
  } catch (error) {
    if ([400, 403, 404, 409, 422].includes(error?.status) && sendServiceError(error, res)) return;
    return next(error);
  }
}

async function read(req, res, next) {
  try {
    // The route has already authorized the order relationship. Vendors receive
    // completion metadata only, never recipient contact or evidence URLs.
    const attributes = req.user.role === 'vendor'
      ? ['id', 'order_id', 'proof_type', 'captured_at'] : undefined;
    const proof = await DeliveryProof.findOne({ where: { order_id: req.order.id }, attributes });

    return res.status(200).json({ proof });
  } catch (error) {
    return next(error);
  }
}

async function timeline(req, res, next) {
  try {
    const events = await OrderTimeline.findAll({
      where: { order_id: req.order.id },
      attributes: ['id', 'order_id', 'from_status', 'to_status', 'actor_role', 'createdAt'],
      order: [['createdAt', 'ASC'], ['id', 'ASC']],
    });
    return res.status(200).json({ events });
  } catch (error) { return next(error); }
}

module.exports = { submit, read, timeline };
