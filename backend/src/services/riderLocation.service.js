/**
 * MZAYA rider location persistence and order-scoped publishing.
 */
const { Rider, Order } = require('../models/associations');
const { publishRiderLocation } = require('../realtime/orderPublisher');

async function updateRiderLocation({
  riderUserId,
  lat,
  lng,
  accuracy,
  heading,
  speed,
  recordedAt,
}) {
  const rider = await Rider.findOne({ where: { user_id: riderUserId } });
  if (!rider) {
    const error = new Error('Rider profile not found');
    error.status = 404;
    throw error;
  }

  const location = {
    lat: Number(lat),
    lng: Number(lng),
    accuracy: accuracy == null ? null : Number(accuracy),
    heading: heading == null ? null : Number(heading),
    speed: speed == null ? null : Number(speed),
    recordedAt: recordedAt || new Date().toISOString(),
  };

  await rider.update({
    current_location: {
      ...location,
      updated_at: location.recordedAt,
    },
  });

  const activeOrders = await Order.findAll({
    where: {
      rider_id: riderUserId,
      status: ['accepted', 'picked_up', 'en_route'],
    },
  });

  activeOrders.forEach((order) => {
    publishRiderLocation({ order, location });
  });

  return {
    location,
    activeOrderIds: activeOrders.map((order) => order.id),
  };
}

module.exports = { updateRiderLocation };
