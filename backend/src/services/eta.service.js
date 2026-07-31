const { distanceKm } = require('../utils/geo');

const DEFAULTS = Object.freeze({
  urbanSpeedKph: Number(process.env.DISPATCH_URBAN_SPEED_KPH || 28),
  pickupBufferMinutes: Number(process.env.DISPATCH_PICKUP_BUFFER_MINUTES || 4),
  dropoffBufferMinutes: Number(process.env.DISPATCH_DROPOFF_BUFFER_MINUTES || 3),
});

function travelMinutes(distance, speedKph = DEFAULTS.urbanSpeedKph) {
  if (distance == null || !Number.isFinite(Number(distance))) return null;
  const safeSpeed = Math.max(Number(speedKph), 5);
  return Math.max(1, Math.ceil((Number(distance) / safeSpeed) * 60));
}

function estimateOrderETA({ riderLocation, pickupLocation, dropoffLocation }) {
  const pickupDistanceKm = distanceKm(riderLocation, pickupLocation);
  const deliveryDistanceKm = distanceKm(pickupLocation, dropoffLocation);

  const pickupTravelMinutes = travelMinutes(pickupDistanceKm);
  const deliveryTravelMinutes = travelMinutes(deliveryDistanceKm);

  return {
    pickupDistanceKm,
    deliveryDistanceKm,
    pickupEtaMinutes:
      pickupTravelMinutes == null
        ? null
        : pickupTravelMinutes + DEFAULTS.pickupBufferMinutes,
    deliveryEtaMinutes:
      deliveryTravelMinutes == null
        ? null
        : deliveryTravelMinutes + DEFAULTS.dropoffBufferMinutes,
    totalEtaMinutes:
      pickupTravelMinutes == null || deliveryTravelMinutes == null
        ? null
        : pickupTravelMinutes +
          deliveryTravelMinutes +
          DEFAULTS.pickupBufferMinutes +
          DEFAULTS.dropoffBufferMinutes,
  };
}

module.exports = { estimateOrderETA, travelMinutes, DEFAULTS };
