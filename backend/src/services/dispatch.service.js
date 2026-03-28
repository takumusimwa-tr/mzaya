const { CATEGORY_TYPE, VEHICLE_TYPE, WEIGHT_THRESHOLD, ORDER_STATUS } = require('../config/constants');
const { calculateFees, convertToZig } = require('../utils/feeCalculator');
const { User, Order } = require('../models/associations');
const { Op } = require('sequelize');

function assignVehicleType(categoryType, weightKg = 0) {
  if (
    categoryType === CATEGORY_TYPE.ERRAND ||
    categoryType === CATEGORY_TYPE.FOOD
  ) {
    return VEHICLE_TYPE.BIKE;
  }
  if (weightKg <= WEIGHT_THRESHOLD.BIKE_MAX)   return VEHICLE_TYPE.BIKE;
  if (weightKg <= WEIGHT_THRESHOLD.BAKKIE_MAX) return VEHICLE_TYPE.BAKKIE;
  return VEHICLE_TYPE.TRUCK;
}

async function findAvailableRider(city, vehicleType) {
  const busyRiderIds = await Order.findAll({
    where: {
      status: {
        [Op.in]: [
          ORDER_STATUS.ACCEPTED,
          ORDER_STATUS.PICKED_UP,
          ORDER_STATUS.EN_ROUTE,
        ],
      },
      rider_id: { [Op.ne]: null },
    },
    attributes: ['rider_id'],
    raw: true,
  }).then(orders => orders.map(o => o.rider_id));

  const whereClause = {
    role:       'rider',
    isVerified: true,
  };

  if (busyRiderIds.length > 0) {
    whereClause.id = { [Op.notIn]: busyRiderIds };
  }

  const rider = await User.findOne({ where: whereClause });
  return rider || null;
}

function calculateDistanceKm(pickup, dropoff) {
  if (!pickup?.lat || !dropoff?.lat) return 5;
  const R    = 6371;
  const dLat = toRad(dropoff.lat - pickup.lat);
  const dLng = toRad(dropoff.lng - pickup.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(pickup.lat)) *
    Math.cos(toRad(dropoff.lat)) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

async function dispatchOrder({
  order,
  categoryType,
  weightKg,
  pickupLocation,
  dropoffLocation,
  subtotalUsd,
  estimatedDurationMinutes,
  zigRate,
}) {
  const vehicleType = assignVehicleType(categoryType, weightKg);
  const distanceKm  = calculateDistanceKm(pickupLocation, dropoffLocation);

  const fees = calculateFees({
    categoryType,
    vehicleType,
    distanceKm,
    subtotalUsd,
    weightKg,
    estimatedDurationMinutes,
  });

  const totalZig = zigRate ? convertToZig(fees.total_usd, zigRate) : null;
  const rider    = await findAvailableRider(order.city, vehicleType);

  await order.update({
    vehicle_type:      vehicleType,
    rider_id:          rider?.id || null,
    status:            rider ? ORDER_STATUS.ACCEPTED : ORDER_STATUS.PENDING,
    subtotal_usd:      fees.subtotal_usd,
    delivery_fee_usd:  fees.delivery_fee_usd,
    total_usd:         fees.total_usd,
    zig_rate_snapshot: zigRate || null,
    total_zig:         totalZig,
    accepted_at:       rider ? new Date() : null,
  });

  return {
    vehicleType,
    distanceKm:  parseFloat(distanceKm.toFixed(2)),
    fees,
    totalZig,
    rider:      rider ? { id: rider.id, name: rider.name, phone: rider.phone } : null,
    dispatched: !!rider,
  };
}

module.exports = {
  dispatchOrder,
  assignVehicleType,
  findAvailableRider,
  calculateDistanceKm,
};