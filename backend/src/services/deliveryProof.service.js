const { sequelize } = require('../config/db');
const {
  Order,
  DeliveryProof,
  OrderTimeline,
} = require('../models/associations');
const { orderEvents, ORDER_EVENT } = require('../events/order.events');
const { applyDeliveryCompletionEffects } = require('./deliveryCompletion.service');

function serviceError(message, status = 400, code = 'DELIVERY_PROOF_ERROR') {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function validateProofPayload(payload) {
  for (const [key, max] of Object.entries({ recipientName: 120, recipientPhone: 40, notes: 500, photoUrl: 4096, signatureUrl: 4096 })) {
    const value = payload[key];
    if (value != null && (typeof value !== 'string' || value.length > max)) {
      throw serviceError(`Invalid ${key}`, 422, 'INVALID_PROOF_FIELD');
    }
  }
  for (const [key, limit] of Object.entries({ latitude: 90, longitude: 180 })) {
    const value = payload[key];
    if (value != null && (typeof value !== 'number' || !Number.isFinite(value) || Math.abs(value) > limit)) {
      throw serviceError(`Invalid ${key}`, 422, 'INVALID_COORDINATES');
    }
  }
  if ((payload.latitude == null) !== (payload.longitude == null)) {
    throw serviceError('Both coordinates are required', 422, 'INVALID_COORDINATES');
  }
  switch (payload.proofType) {
    case 'otp':
      throw serviceError('OTP must be verified by a trusted server; OTP proof is disabled', 422, 'OTP_DISABLED');
    case 'photo':
      if (!payload.photoUrl?.trim()) {
        throw serviceError(
          'Delivery photo is required',
          422,
          'PHOTO_REQUIRED'
        );
      }
      break;
    case 'signature':
      if (!payload.signatureUrl?.trim()) {
        throw serviceError(
          'Recipient signature is required',
          422,
          'SIGNATURE_REQUIRED'
        );
      }
      break;
    case 'recipient_confirmation':
      if (!payload.recipientName?.trim()) {
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
    recipientName, recipientPhone, notes, latitude, longitude,
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
    if (!riderUserId || !order.rider_id || String(order.rider_id) !== String(riderUserId)) {
      throw serviceError(
        'This delivery belongs to another Mzaya',
        403,
        'DELIVERY_FORBIDDEN'
      );
    }
    const existing = await DeliveryProof.findOne({
      where: { order_id: order.id }, transaction, lock: transaction.LOCK.UPDATE,
    });
    if (existing && order.status === 'delivered') {
      const fields = { proof_type: proofType, recipient_name: recipientName, recipient_phone: recipientPhone,
        photo_url: photoUrl, signature_url: signatureUrl, notes, latitude, longitude };
      const matches = Object.entries(fields).every(([key, value]) => {
        if (key === 'latitude' || key === 'longitude') {
          return value == null ? existing[key] == null : existing[key] != null && Number(existing[key]) === Number(value.toFixed(7));
        }
        return (existing[key] ?? null) === (value ?? null);
      });
      if (matches && String(existing.rider_id) === String(riderUserId)) return { order, proof: existing, replayed: true };
      throw serviceError('Delivery proof differs from completed submission', 409, 'PROOF_CONFLICT');
    }
    if (order.status !== 'en_route' || existing) {
      throw serviceError('Delivery proof cannot be submitted in this state', 409, 'INVALID_ORDER_STATUS');
    }

    const proof = await DeliveryProof.create({
      order_id: order.id,
      rider_id: riderUserId,
      proof_type: proofType,
      recipient_name: recipientName || null,
      recipient_phone: recipientPhone || null,
      otp_verified: false,
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
      delivery_proof_url: proof.photo_url || null,
    }, { transaction });

    await applyDeliveryCompletionEffects({ order, transaction });

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

    return { order, proof, replayed: false };
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
