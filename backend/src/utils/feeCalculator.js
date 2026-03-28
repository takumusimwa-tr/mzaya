const { CATEGORY_TYPE, VEHICLE_TYPE, WEIGHT_THRESHOLD } = require('../config/constants');

// ─── Base delivery fees (USD) per vehicle type ────────────────────────────────
const BASE_FEES = {
  [VEHICLE_TYPE.BIKE]:   2.50,
  [VEHICLE_TYPE.BAKKIE]: 8.00,
  [VEHICLE_TYPE.TRUCK]:  20.00,
};

// ─── Per km rate (USD) per vehicle type ──────────────────────────────────────
const PER_KM_RATE = {
  [VEHICLE_TYPE.BIKE]:   0.30,
  [VEHICLE_TYPE.BAKKIE]: 0.80,
  [VEHICLE_TYPE.TRUCK]:  1.50,
};

// ─── Platform commission per category (%) ────────────────────────────────────
const COMMISSION_RATE = {
  [CATEGORY_TYPE.FOOD]:      0.15, // 15%
  [CATEGORY_TYPE.GROCERY]:   0.12, // 12%
  [CATEGORY_TYPE.MATERIALS]: 0.10, // 10%
  [CATEGORY_TYPE.ERRAND]:    0.20, // 20% — time-based, higher margin
};

// ─── Errand base fee (USD) — charged per estimated hour ──────────────────────
const ERRAND_HOURLY_RATE = 3.00;

// ─── Main fee calculator ──────────────────────────────────────────────────────
function calculateFees({
  categoryType,
  vehicleType,
  distanceKm,
  subtotalUsd,
  weightKg = 0,
  estimatedDurationMinutes = 0,
}) {
  // Delivery fee = base + per km charge
  const baseFee   = BASE_FEES[vehicleType] || BASE_FEES[VEHICLE_TYPE.BIKE];
  const kmCharge  = (distanceKm || 0) * (PER_KM_RATE[vehicleType] || PER_KM_RATE[VEHICLE_TYPE.BIKE]);

  let deliveryFee = baseFee + kmCharge;

  // Heavy materials surcharge — extra $0.01 per kg over 20kg
  if (categoryType === CATEGORY_TYPE.MATERIALS && weightKg > WEIGHT_THRESHOLD.BIKE_MAX) {
    const extraKg   = weightKg - WEIGHT_THRESHOLD.BIKE_MAX;
    deliveryFee    += extraKg * 0.01;
  }

  // Errand fee — based on estimated duration instead of subtotal
  let errandFee = 0;
  if (categoryType === CATEGORY_TYPE.ERRAND) {
    const hours = (estimatedDurationMinutes || 60) / 60;
    errandFee   = Math.max(hours * ERRAND_HOURLY_RATE, ERRAND_HOURLY_RATE); // minimum 1hr
  }

  // Platform commission on subtotal
  const commissionRate = COMMISSION_RATE[categoryType] || 0.15;
  const commission     = (subtotalUsd || 0) * commissionRate;

  // Total
  const total = (subtotalUsd || 0) + deliveryFee + errandFee;

  return {
    subtotal_usd:    parseFloat((subtotalUsd || 0).toFixed(2)),
    delivery_fee_usd: parseFloat((deliveryFee + errandFee).toFixed(2)),
    commission_usd:  parseFloat(commission.toFixed(2)),
    total_usd:       parseFloat(total.toFixed(2)),
    breakdown: {
      base_fee:     parseFloat(baseFee.toFixed(2)),
      km_charge:    parseFloat(kmCharge.toFixed(2)),
      errand_fee:   parseFloat(errandFee.toFixed(2)),
      weight_surcharge: parseFloat((deliveryFee - baseFee - kmCharge).toFixed(2)),
    },
  };
}

// ─── Convert USD total to ZiG using live rate ─────────────────────────────────
function convertToZig(amountUsd, zigRate) {
  if (!zigRate || zigRate <= 0) return null;
  return parseFloat((amountUsd * zigRate).toFixed(2));
}

module.exports = { calculateFees, convertToZig };