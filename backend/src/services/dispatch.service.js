const { Op } = require('sequelize');
const {
  Order,
  DispatchOffer,
} = require('../models/associations');
const { sequelize } = require('../config/db');
const { findAvailableRiders } = require('./riderAvailability.service');
const { rankCandidates } = require('./dispatchRanking.service');
const { publishOrderAssigned } = require('../realtime/orderPublisher');

const OFFER_TIMEOUT_SECONDS = Number(
  process.env.DISPATCH_OFFER_TIMEOUT_SECONDS || 30
);

function serviceError(message, status = 400, code = 'DISPATCH_ERROR') {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

async function recentAssignmentCounts(riderIds) {
  if (!riderIds.length) return new Map();
  const since = new Date(Date.now() - 60 * 60 * 1000);

  const offers = await DispatchOffer.findAll({
    where: {
      rider_id: { [Op.in]: riderIds },
      status: 'accepted',
      responded_at: { [Op.gte]: since },
    },
    attributes: ['rider_id'],
    raw: true,
  });

  const counts = new Map();
  offers.forEach(({ rider_id: riderId }) => {
    const key = String(riderId);
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return counts;
}

async function dispatchOrder(orderId) {
  const order = await Order.findByPk(orderId);
  if (!order) throw serviceError('Order not found', 404, 'ORDER_NOT_FOUND');

  if (order.rider_id) {
    throw serviceError('Order already has a Mzaya assigned', 409, 'ALREADY_ASSIGNED');
  }

  const openOffer = await DispatchOffer.findOne({
    where: { order_id: order.id, status: 'offered' },
  });
  if (openOffer && openOffer.expires_at > new Date()) return openOffer;

  if (!order.pickup_location) {
    throw serviceError(
      'Pickup coordinates are required for automatic dispatch',
      422,
      'PICKUP_LOCATION_REQUIRED'
    );
  }

  const candidates = await findAvailableRiders(order);
  const counts = await recentAssignmentCounts(
    candidates.map((candidate) => candidate.userId)
  );
  const ranked = rankCandidates({
    candidates,
    order,
    recentAssignmentCounts: counts,
  });

  const previouslyTried = await DispatchOffer.findAll({
    where: {
      order_id: order.id,
      status: { [Op.in]: ['declined', 'expired', 'cancelled'] },
    },
    attributes: ['rider_id'],
    raw: true,
  });
  const excluded = new Set(previouslyTried.map(({ rider_id }) => String(rider_id)));
  const winner = ranked.find(({ userId }) => !excluded.has(String(userId)));

  if (!winner) {
    throw serviceError(
      'No available Mzaya found',
      409,
      'NO_AVAILABLE_RIDER'
    );
  }

  const offer = await DispatchOffer.create({
    order_id: order.id,
    rider_id: winner.userId,
    status: 'offered',
    score: winner.score,
    distance_km: winner.distanceKm,
    pickup_eta_minutes: winner.eta.pickupEtaMinutes,
    expires_at: new Date(Date.now() + OFFER_TIMEOUT_SECONDS * 1000),
  });

  publishOrderAssigned(order, winner.userId);
  return offer;
}

async function respondToOffer({ offerId, riderUserId, accept, declineReason }) {
  return sequelize.transaction(async (transaction) => {
    const offer = await DispatchOffer.findByPk(offerId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!offer) throw serviceError('Dispatch offer not found', 404, 'OFFER_NOT_FOUND');
    if (String(offer.rider_id) !== String(riderUserId)) {
      throw serviceError('This offer belongs to another Mzaya', 403, 'OFFER_FORBIDDEN');
    }
    if (offer.status !== 'offered') {
      throw serviceError('This dispatch offer is no longer active', 409, 'OFFER_CLOSED');
    }
    if (offer.expires_at <= new Date()) {
      await offer.update(
        { status: 'expired', responded_at: new Date() },
        { transaction }
      );
      throw serviceError('This dispatch offer has expired', 409, 'OFFER_EXPIRED');
    }

    const order = await Order.findByPk(offer.order_id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!order) throw serviceError('Order not found', 404, 'ORDER_NOT_FOUND');
    if (order.rider_id) {
      await offer.update(
        { status: 'cancelled', responded_at: new Date() },
        { transaction }
      );
      throw serviceError('Order has already been assigned', 409, 'ALREADY_ASSIGNED');
    }

    if (!accept) {
      await offer.update({
        status: 'declined',
        responded_at: new Date(),
        decline_reason: declineReason || null,
      }, { transaction });

      return { accepted: false, orderId: order.id };
    }

    await offer.update({
      status: 'accepted',
      responded_at: new Date(),
    }, { transaction });

    await order.update({
      rider_id: riderUserId,
      status: 'rider_assigned',
      accepted_at: new Date(),
    }, { transaction });

    await DispatchOffer.update({
      status: 'cancelled',
      responded_at: new Date(),
    }, {
      where: {
        order_id: order.id,
        id: { [Op.ne]: offer.id },
        status: 'offered',
      },
      transaction,
    });

    return { accepted: true, order, offer };
  });
}

async function expireOffersAndRedispatch() {
  const expired = await DispatchOffer.findAll({
    where: {
      status: 'offered',
      expires_at: { [Op.lte]: new Date() },
    },
  });

  const orderIds = [];
  for (const offer of expired) {
    await offer.update({ status: 'expired', responded_at: new Date() });
    orderIds.push(offer.order_id);
  }

  const results = [];
  for (const orderId of [...new Set(orderIds)]) {
    try {
      const offer = await dispatchOrder(orderId);
      results.push({ orderId, offerId: offer.id, redispatched: true });
    } catch (error) {
      results.push({ orderId, redispatched: false, code: error.code });
    }
  }
  return results;
}

module.exports = {
  OFFER_TIMEOUT_SECONDS,
  dispatchOrder,
  respondToOffer,
  expireOffersAndRedispatch,
};
