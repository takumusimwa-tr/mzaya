const { sequelize } = require('../config/db');
const {
  Order,
  DeliveryProof,
  OrderTimeline,
} = require('../models/associations');
const { orderEvents, ORDER_EVENT } = require('../events/order.events');

function serviceError(message, status = 400, code = 'DELIVERY_PROOF_ERROR') {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function validateProofPayload(payload) {
  switch (payload.proofType) {
    case 'otp':
      if (!payload.otpVerified) {
        throw serviceError(
          'OTP must be verified before completing delivery',
          422,
          'OTP_NOT_VERIFIED'
        );
      }
      break;
    case 'photo':
      if (!payload.photoUrl) {
        throw serviceError(
          'Delivery photo is required',
          422,
          'PHOTO_REQUIRED'
        );
      }
      break;
    case 'signature':
      if (!payload.signatureUrl) {
        throw serviceError(
          'Recipient signature is required',
          422,
          'SIGNATURE_REQUIRED'
        );
      }
      break;
    case 'recipient_confirmation':
      if (!payload.recipientName) {
        throw serviceError(
          'Recipient name is required',
          422,
          'RECIPIENT_REQUIRED'
        );
      }
      break;
    default:
      throw serviceError('Unsupported proof type', 422, 'INVALID_PROOF_TYPE');
  }
}

async function submitDeliveryProof({
  orderId,
  riderUserId,
  proofType,
  recipientName,
  recipientPhone,
  otpVerified,
  photoUrl,
  signatureUrl,
  notes,
  latitude,
  longitude,
}) {
  validateProofPayload({
    proofType,
    recipientName,
    otpVerified,
    photoUrl,
    signatureUrl,
  });

  return sequelize.transaction(async (transaction) => {
    const order = await Order.findByPk(orderId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!order) {
      throw serviceError('Order not found', 404, 'ORDER_NOT_FOUND');
    }
    if (String(order.rider_id) !== String(riderUserId)) {
      throw serviceError(
        'This delivery belongs to another Mzaya',
        403,
        'DELIVERY_FORBIDDEN'
      );
    }
    if (order.status !== 'en_route') {
      throw serviceError(
        'Delivery proof can only be submitted while en route',
        409,
        'INVALID_ORDER_STATUS'
      );
    }

    const existing = await DeliveryProof.findOne({
      where: { order_id: order.id },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (existing) {
      throw serviceError(
        'Delivery proof has already been submitted',
        409,
        'PROOF_ALREADY_EXISTS'
      );
    }

    const proof = await DeliveryProof.create({
      order_id: order.id,
      rider_id: riderUserId,
      proof_type: proofType,
      recipient_name: recipientName || null,
      recipient_phone: recipientPhone || null,
      otp_verified: Boolean(otpVerified),
      photo_url: photoUrl || null,
      signature_url: signatureUrl || null,
      notes: notes || null,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      captured_at: new Date(),
    }, { transaction });

    const previousStatus = order.status;
    await order.update({
      status: 'delivered',
      delivered_at: new Date(),
    }, { transaction });

    await OrderTimeline.create({
      order_id: order.id,
      from_status: previousStatus,
      to_status: 'delivered',
      actor_id: riderUserId,
      actor_role: 'rider',
      metadata: {
        delivery_proof_id: proof.id,
        proof_type: proof.proof_type,
      },
    }, { transaction });

    transaction.afterCommit(() => {
      orderEvents.emit(ORDER_EVENT.STATUS_CHANGED, {
        orderId: order.id,
        fromStatus: previousStatus,
        toStatus: 'delivered',
        actorId: riderUserId,
        changedAt: new Date().toISOString(),
      });
    });

    return { order, proof };
  });
}

async function getDeliveryProof({ orderId, requester }) {
  const order = await Order.findByPk(orderId);
  if (!order) throw serviceError('Order not found', 404, 'ORDER_NOT_FOUND');

  const permitted =
    requester.role === 'admin' ||
    String(order.customer_id) === String(requester.id) ||
    String(order.rider_id) === String(requester.id);

  if (!permitted) {
    throw serviceError('You cannot view this delivery proof', 403, 'PROOF_FORBIDDEN');
  }

  return DeliveryProof.findOne({ where: { order_id: orderId } });
}

module.exports = {
  validateProofPayload,
  submitDeliveryProof,
  getDeliveryProof,
};
