const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const { Order, Rider } = require('../models/associations');
const { VEHICLE_RANK } = require('../config/constants');

const ACTIVE = ['accepted', 'picked_up', 'en_route'];
const rank = (vehicle) => VEHICLE_RANK[vehicle] || VEHICLE_RANK.bicycle;

function claimError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// Lock the rider row FIRST, matching automatic dispatch's lock ordering.
// All reads used to decide availability must occur inside the same transaction.
async function claimOrderForRider(orderId, riderUserId) {
  return sequelize.transaction(async (transaction) => {
    const rider = await Rider.findOne({
      where: { user_id: riderUserId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!rider) throw claimError(404, 'Rider profile not found');
    if (!rider.is_approved || !rider.is_online) {
      throw claimError(403, 'Mzaya must be approved and online to claim orders');
    }

    const busy = await Order.findOne({
      where: { rider_id: riderUserId, status: { [Op.in]: ACTIVE } },
      transaction,
    });
    if (busy) throw claimError(409, 'Mzaya already has an active order');

    const order = await Order.findByPk(orderId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!order) throw claimError(404, 'Order not found');
    if (order.rider_id) throw claimError(409, 'This order was already taken by another rider');
    if (order.status !== 'pending') throw claimError(409, 'This order is no longer available');
    if (rank(rider.vehicle_type) < rank(order.vehicle_type)) {
      throw claimError(403, 'This order needs a larger vehicle than your registered one');
    }
    if (order.city) {
      const { City } = require('../models/associations');
      const city = await City.findByPk(rider.city_id, { transaction });
      if (!city || ![city.slug, city.name].some((name) =>
        String(name || '').toLowerCase() === String(order.city).toLowerCase())) {
        throw claimError(403, 'Mzaya is not registered in this order city');
      }
    }

    const [count] = await Order.update(
      { rider_id: riderUserId, status: 'accepted', accepted_at: new Date() },
      { where: { id: order.id, rider_id: null, status: 'pending' }, transaction },
    );
    if (count !== 1) throw claimError(409, 'This order was already taken by another rider');
    return Order.findByPk(order.id, { transaction });
  });
}

module.exports = { claimOrderForRider };
