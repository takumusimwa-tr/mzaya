const {
  CATEGORY_TYPE, VEHICLE_TYPE, VEHICLE_RANK, VEHICLE_LADDER, ORDER_STATUS,
} = require('../config/constants');
const { calculateFees, convertToZig, feeTierFor } = require('../utils/feeCalculator');
const { User, Order, Rider, City } = require('../models/associations');
const { Op } = require('sequelize');

// ─── Decide which vehicle class an order requires ─────────────────────────────
// Food & errands are always light (bicycle-level — any vehicle can take them).
// Grocery/materials scale by weight: walk the ascending ladder and pick the
// FIRST (smallest) vehicle whose max payload covers the order weight.
function assignVehicleType(categoryType, weightKg = 0) {
  if (categoryType === CATEGORY_TYPE.ERRAND || categoryType === CATEGORY_TYPE.FOOD) {
    return VEHICLE_TYPE.BICYCLE;
  }
  const w = Number(weightKg) || 0;
  const tier = VEHICLE_LADDER.find((t) => w <= t.maxKg);
  return tier ? tier.cls : VEHICLE_TYPE.TRUCK_10T;
}

// ─── Numeric rank for a vehicle string (unknown → 0 so it never over-matches) ──
function rankOf(vehicle) {
  return VEHICLE_RANK[vehicle] || 0;
}


// ─── Find an available rider for auto-dispatch ────────────────────────────────
// Respects (1) required vehicle class, (2) the order's city, (3) rider online +
// approved status. Eligible riders have vehicle rank >= required rank; among
// them, pick the smallest sufficient vehicle (don't send a 10t to a burrito).
async function findAvailableRider(city, vehicleType) {
  const requiredRank = rankOf(vehicleType);

  const busyUserIds = await Order.findAll({
    where: {
      status:   { [Op.in]: [ORDER_STATUS.ACCEPTED, ORDER_STATUS.PICKED_UP, ORDER_STATUS.EN_ROUTE] },
      rider_id: { [Op.ne]: null },
    },
    attributes: ['rider_id'],
    raw: true,
  }).then((rows) => rows.map((r) => r.rider_id));

  // Resolve order city string → city_id to match rider.city_id.
  let cityId = null;
  if (city && City) {
    try {
      const cityRow = await City.findOne({ where: { name: { [Op.iLike]: city } } });
      if (cityRow) cityId = cityRow.id;
    } catch (e) {
      cityId = null;
    }
  }

  const riderWhere = { is_online: true, is_approved: true };
  if (cityId) riderWhere.city_id = cityId;
  if (busyUserIds.length) riderWhere.user_id = { [Op.notIn]: busyUserIds };

  const candidates = await Rider.findAll({ where: riderWhere });

  const eligible = candidates
    .filter((r) => rankOf(r.vehicle_type) >= requiredRank)
    .sort((a, b) => rankOf(a.vehicle_type) - rankOf(b.vehicle_type));

  if (!eligible.length) return null;

  // rider_id on orders references users(id), so return the linked user.
  const user = await User.findByPk(eligible[0].user_id);
  return user || null;
}

function calculateDistanceKm(pickup, dropoff) {
  if (!pickup?.lat || !dropoff?.lat) return 5;
  const R    = 6371;
  const dLat = toRad(dropoff.lat - pickup.lat);
  const dLng = toRad(dropoff.lng - pickup.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(pickup.lat)) * Math.cos(toRad(dropoff.lat)) *
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
  deferDispatch = false, // scheduled orders: compute fees but don't assign a rider yet
}) {
  const vehicleType = assignVehicleType(categoryType, weightKg);
  const distanceKm  = calculateDistanceKm(pickupLocation, dropoffLocation);

  const fees = calculateFees({
    categoryType,
    vehicleType: feeTierFor(vehicleType), // map granular class → fee tier
    distanceKm,
    subtotalUsd,
    weightKg,
    estimatedDurationMinutes,
  });

  const totalZig = zigRate ? convertToZig(fees.total_usd, zigRate) : null;

  // Scheduled orders lock in fees/vehicle now but stay 'scheduled' with no rider
  // until the release job flips them to pending near their delivery time.
  if (deferDispatch) {
    await order.update({
      vehicle_type:      vehicleType,
      subtotal_usd:      fees.subtotal_usd,
      delivery_fee_usd:  fees.delivery_fee_usd,
      total_usd:         fees.total_usd,
      zig_rate_snapshot: zigRate || null,
      total_zig:         totalZig,
    });
    return {
      vehicleType,
      distanceKm: parseFloat(distanceKm.toFixed(2)),
      fees,
      totalZig,
      rider: null,
      dispatched: false,
      scheduled: true,
    };
  }

  const rider = await findAvailableRider(order.city, vehicleType);

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
    distanceKm: parseFloat(distanceKm.toFixed(2)),
    fees,
    totalZig,
    rider: rider ? { id: rider.id, name: rider.name, phone: rider.phone } : null,
    dispatched: !!rider,
  };
}

module.exports = {
  dispatchOrder,
  assignVehicleType,
  findAvailableRider,
  calculateDistanceKm,
  feeTierFor,
  rankOf,
};
