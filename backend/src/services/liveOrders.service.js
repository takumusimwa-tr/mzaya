const { Op } = require('sequelize');
const {
  Order,
  Vendor,
  Rider,
  DispatchOffer,
  OrderTimeline,
} = require('../models/associations');

const CUSTOMER_ACTIVE_STATUSES = [
  'placed',
  'confirmed',
  'preparing',
  'ready',
  'rider_assigned',
  'accepted',
  'picked_up',
  'en_route',
];

const VENDOR_LIVE_STATUSES = [
  'placed',
  'confirmed',
  'preparing',
  'ready',
  'rider_assigned',
  'accepted',
  'picked_up',
  'en_route',
];

const RIDER_ACTIVE_STATUSES = [
  'rider_assigned',
  'accepted',
  'picked_up',
  'en_route',
];

function notFound(message) {
  const error = new Error(message);
  error.status = 404;
  return error;
}

async function getCustomerActiveOrder(customerUserId) {
  return Order.findOne({
    where: {
      customer_id: customerUserId,
      status: { [Op.in]: CUSTOMER_ACTIVE_STATUSES },
    },
    include: [{
      model: OrderTimeline,
      as: 'timeline',
      separate: true,
      order: [['created_at', 'ASC']],
    }],
    order: [['created_at', 'DESC']],
  });
}

async function assertVendorOwnership(ownerUserId, vendorId) {
  const vendor = await Vendor.findByPk(vendorId);
  if (!vendor) throw notFound('Vendor branch not found');

  if (String(vendor.owner_id) !== String(ownerUserId)) {
    const error = new Error('You do not own this vendor branch');
    error.status = 403;
    throw error;
  }

  return vendor;
}

async function getVendorLiveOrders({ ownerUserId, vendorId }) {
  await assertVendorOwnership(ownerUserId, vendorId);

  return Order.findAll({
    where: {
      vendor_id: vendorId,
      status: { [Op.in]: VENDOR_LIVE_STATUSES },
    },
    order: [['created_at', 'ASC']],
  });
}

async function getRiderCurrentOrder(riderUserId) {
  return Order.findOne({
    where: {
      rider_id: riderUserId,
      status: { [Op.in]: RIDER_ACTIVE_STATUSES },
    },
    include: [{
      model: OrderTimeline,
      as: 'timeline',
      separate: true,
      order: [['created_at', 'ASC']],
    }],
    order: [['updated_at', 'DESC']],
  });
}

async function getRiderAvailableOrders(riderUserId) {
  const rider = await Rider.findOne({ where: { user_id: riderUserId } });
  if (!rider) throw notFound('Mzaya profile not found');

  const offers = await DispatchOffer.findAll({
    where: {
      rider_id: riderUserId,
      status: 'offered',
      expires_at: { [Op.gt]: new Date() },
    },
    include: [{
      model: Order,
      as: 'order',
      required: true,
    }],
    order: [['offered_at', 'ASC']],
  });

  return offers.map((offer) => ({
    offer_id: offer.id,
    score: Number(offer.score),
    distance_km:
      offer.distance_km == null ? null : Number(offer.distance_km),
    pickup_eta_minutes: offer.pickup_eta_minutes,
    expires_at: offer.expires_at,
    order: offer.order,
  }));
}

module.exports = {
  CUSTOMER_ACTIVE_STATUSES,
  VENDOR_LIVE_STATUSES,
  RIDER_ACTIVE_STATUSES,
  getCustomerActiveOrder,
  getVendorLiveOrders,
  getRiderCurrentOrder,
  getRiderAvailableOrders,
};
