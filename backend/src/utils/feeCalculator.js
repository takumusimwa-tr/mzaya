const { CATEGORY_TYPE, VEHICLE_RANK, WEIGHT_THRESHOLD } = require('../config/constants');

// ─── Fee tiers ────────────────────────────────────────────────────────────────
// The 11 vehicle classes collapse into 3 pricing tiers. Keyed by literal tier
// string (not VEHICLE_TYPE constants) so renaming vehicle classes never breaks
// pricing. feeTierFor() (below) maps any class → one of these.
const BASE_FEES = {
  bike:   2.50,  // bicycle, motorbike
  bakkie: 8.00,  // hatchback, sedan, suv, ½t, 1t
  truck:  20.00, // 2t and up
};

const PER_KM_RATE = {
  bike:   0.30,
  bakkie: 0.80,
  truck:  1.50,
};

// ─── Map any vehicle class → fee tier (by rank) ───────────────────────────────
// Mirrors feeTierFor in dispatch.service.js. Kept here too so the calculator is
// self-contained and can be called with either a raw class or a tier string.
function feeTierFor(vehicle) {
  if (vehicle === 'bike' || vehicle === 'bakkie' || vehicle === 'truck') return vehicle;
  const rank = VEHICLE_RANK[vehicle] || 0;
  if (rank <= 2) return 'bike';   // bicycle, motorbike
  if (rank <= 7) return 'bakkie'; // hatch, sedan, suv, ½t, 1t
  return 'truck';                 // 2t and up
}

// ─── Platform commission per category (%) ────────────────────────────────────
const COMMISSION_RATE = {
  [CATEGORY_TYPE.FOOD]:      0.15,
  [CATEGORY_TYPE.GROCERY]:   0.12,
  [CATEGORY_TYPE.MATERIALS]: 0.10,
  [CATEGORY_TYPE.ERRAND]:    0.20,
};

const ERRAND_HOURLY_RATE = 3.00;

// ─── Main fee calculator ──────────────────────────────────────────────────────
// vehicleType may be a raw class ('sedan', 'truck_5t') or a tier ('bike').
function calculateFees({
  categoryType,
  vehicleType,
  distanceKm,
  subtotalUsd,
  weightKg = 0,
  estimatedDurationMinutes = 0,
}) {
  const tier      = feeTierFor(vehicleType);
  const baseFee   = BASE_FEES[tier] || BASE_FEES.bike;
  const kmCharge  = (distanceKm || 0) * (PER_KM_RATE[tier] || PER_KM_RATE.bike);

  let deliveryFee = baseFee + kmCharge;

  // Heavy materials surcharge — extra $0.01 per kg over the bike threshold.
  if (categoryType === CATEGORY_TYPE.MATERIALS && weightKg > WEIGHT_THRESHOLD.BIKE_MAX) {
    const extraKg = weightKg - WEIGHT_THRESHOLD.BIKE_MAX;
    deliveryFee  += extraKg * 0.01;
  }

  // Errand fee — based on estimated duration instead of subtotal.
  let errandFee = 0;
  if (categoryType === CATEGORY_TYPE.ERRAND) {
    const hours = (estimatedDurationMinutes || 60) / 60;
    errandFee   = Math.max(hours * ERRAND_HOURLY_RATE, ERRAND_HOURLY_RATE);
  }

  const commissionRate = COMMISSION_RATE[categoryType] || 0.15;
  const commission     = (subtotalUsd || 0) * commissionRate;

  // Zimbabwe uses whole-dollar amounts in practice (USD cents barely circulate).
  // Round the DELIVERY FEE to the nearest whole dollar for a clean, payable
  // amount. Subtotal stays exact (real money owed to the vendor), so the total
  // = exact subtotal + rounded delivery fee.
  const rawDeliveryFee  = deliveryFee + errandFee;
  const roundedDelivery = Math.max(1, Math.round(rawDeliveryFee)); // never $0

  const total = (subtotalUsd || 0) + roundedDelivery;

  return {
    subtotal_usd:     parseFloat((subtotalUsd || 0).toFixed(2)),
    delivery_fee_usd: roundedDelivery,
    commission_usd:   parseFloat(commission.toFixed(2)),
    total_usd:        parseFloat(total.toFixed(2)),
    breakdown: {
      base_fee:         parseFloat(baseFee.toFixed(2)),
      km_charge:        parseFloat(kmCharge.toFixed(2)),
      errand_fee:       parseFloat(errandFee.toFixed(2)),
      weight_surcharge: parseFloat((deliveryFee - baseFee - kmCharge).toFixed(2)),
    },
  };
}

function convertToZig(amountUsd, zigRate) {
  if (!zigRate || zigRate <= 0) return null;
  return parseFloat((amountUsd * zigRate).toFixed(2));
}

module.exports = { calculateFees, convertToZig, feeTierFor };
