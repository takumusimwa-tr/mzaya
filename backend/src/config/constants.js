// ─── Order categories ─────────────────────────────────────────────────────────
const CATEGORY_TYPE = {
  FOOD:      'food',
  GROCERY:   'grocery',
  MATERIALS: 'materials',
  ERRAND:    'errand',
};

// ─── Vehicle spectrum (Zimbabwe) ──────────────────────────────────────────────
// Full ladder from human-powered up to heavy trucks. Riders sign up with the
// vehicle they actually own — most own a car (hatch/sedan/SUV), not a truck.
// Light tiers behave DoorDash-style (any of them can take a food/errand order);
// gating bites at the materials end where load weight genuinely needs a bigger
// vehicle. A rider qualifies for any order whose rank <= their own vehicle rank.
const VEHICLE_TYPE = {
  BICYCLE:     'bicycle',
  MOTORBIKE:   'motorbike',
  HATCHBACK:   'hatchback',
  SEDAN:       'sedan',
  SUV:         'suv',
  PICKUP_HALF: 'pickup_half', // ½-tonne bakkie
  PICKUP_1T:   'pickup_1t',   // 1-tonne pickup
  TRUCK_2T:    'truck_2t',
  TRUCK_5T:    'truck_5t',
  TRUCK_7T:    'truck_7t',
  TRUCK_10T:   'truck_10t',
};

// ─── Vehicle capability rank ──────────────────────────────────────────────────
// Higher rank = bigger vehicle = can also fulfil everything below it.
const VEHICLE_RANK = {
  bicycle:     1,
  motorbike:   2,
  hatchback:   3,
  sedan:       4,
  suv:         5,
  pickup_half: 6,
  pickup_1t:   7,
  truck_2t:    8,
  truck_5t:    9,
  truck_7t:    10,
  truck_10t:   11,
};

// ─── Vehicle max payload (kg) ─────────────────────────────────────────────────
// For car tiers these are soft guidance (body/volume matters more than a hard
// kg limit); for pickup/truck tiers they are the real load ceiling that drives
// materials matching. Ordered ascending — assignVehicleType walks this to pick
// the smallest vehicle that can carry the order weight.
const VEHICLE_MAX_KG = {
  bicycle:     10,
  motorbike:   30,
  hatchback:   150,
  sedan:       200,
  suv:         400,
  pickup_half: 500,
  pickup_1t:   1000,
  truck_2t:    2000,
  truck_5t:    5000,
  truck_7t:    7000,
  truck_10t:   Infinity, // anything above 7t
};

// ─── Display metadata (single source of truth for the frontend) ───────────────
// name = what riders/customers see; hint = capacity guidance shown alongside.
// Exposed via GET /api/vehicles so the UI never hardcodes this list.
const VEHICLE_META = {
  bicycle:     { name: 'Bicycle',             hint: 'Up to 10kg — documents, small food' },
  motorbike:   { name: 'Motorbike',           hint: 'Up to 30kg — food, errands, documents' },
  hatchback:   { name: 'Hatchback',           hint: 'Up to 150kg — groceries, small parcels' },
  sedan:       { name: 'Sedan',               hint: 'Up to 200kg — groceries, medium parcels' },
  suv:         { name: 'SUV / Station wagon', hint: 'Up to 400kg — bulk groceries, bigger loads' },
  pickup_half: { name: 'Bakkie (½-tonne)',    hint: 'Up to 500kg — light materials, appliances' },
  pickup_1t:   { name: '1-tonne pickup',      hint: 'Up to 1,000kg — materials, furniture' },
  truck_2t:    { name: '2-tonne truck',       hint: 'Up to 2,000kg — medium materials, small moves' },
  truck_5t:    { name: '5-tonne truck',       hint: 'Up to 5,000kg — bulk cement, sand' },
  truck_7t:    { name: '7-tonne truck',       hint: 'Up to 7,000kg — heavy building materials' },
  truck_10t:   { name: '10-tonne truck',      hint: 'Over 7,000kg — bulk / heavy loads' },
};

// Ascending list of { cls, maxKg, rank } for weight → vehicle resolution.
const VEHICLE_LADDER = Object.keys(VEHICLE_RANK)
  .sort((a, b) => VEHICLE_RANK[a] - VEHICLE_RANK[b])
  .map((cls) => ({ cls, maxKg: VEHICLE_MAX_KG[cls], rank: VEHICLE_RANK[cls] }));

// ─── Order lifecycle statuses ─────────────────────────────────────────────────
const ORDER_STATUS = {
  SCHEDULED: 'scheduled',  // future-dated order, not yet dispatchable
  PENDING:   'pending',
  ACCEPTED:  'accepted',
  PICKED_UP: 'picked_up',
  EN_ROUTE:  'en_route',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  FAILED:    'failed',
};

// ─── Payment methods (all digital — no cash) ──────────────────────────────────
const PAYMENT_METHOD = {
  ECOCASH:   'ecocash',
  ONEMONEY:  'onemoney',
  INNBUCKS:  'innbucks',
  OMARI:     'omari',
  ZIPIT:     'zipit',
  VISA:      'visa',
  MASTERCARD:'mastercard',
  // Paynow's hosted card page — accepts international cards too, so someone
  // paying from the diaspora uses this. There is no separate "diaspora" method:
  // it would have routed to the identical endpoint.
  CARD:      'card',
};

// ─── Currency ─────────────────────────────────────────────────────────────────
const CURRENCY = {
  USD: 'usd',
  ZIG: 'zig',
};

// ─── Payment statuses ─────────────────────────────────────────────────────────
const PAYMENT_STATUS = {
  PENDING:  'pending',
  SUCCESS:  'success',
  FAILED:   'failed',
  REFUNDED: 'refunded',
};

// ─── User roles ───────────────────────────────────────────────────────────────
const USER_ROLE = {
  CUSTOMER: 'customer',
  RIDER:    'rider',
  VENDOR:   'vendor',
  ADMIN:    'admin',
};

// ─── Supported cities ─────────────────────────────────────────────────────────
const CITY = {
  HARARE:   'harare',
  BULAWAYO: 'bulawayo',
  MUTARE:   'mutare',
};

// ─── Legacy weight thresholds (kept for backward compatibility) ───────────────
// Older code referenced WEIGHT_THRESHOLD.BIKE_MAX / BAKKIE_MAX. Preserved so
// nothing breaks; new logic uses VEHICLE_MAX_KG / VEHICLE_LADDER instead.
const WEIGHT_THRESHOLD = {
  BIKE_MAX:   30,
  BAKKIE_MAX: 500,
};

// ─── JWT ─────────────────────────────────────────────────────────────────────
const JWT = {
  EXPIRES_IN:         '7d',
  REFRESH_EXPIRES_IN: '30d',
};

// ─── ContiPay gateway config ──────────────────────────────────────────────────
const CONTIPAY = {
  DEV_URL:  'https://api-dev.contipay.co.zw',
  LIVE_URL: 'https://api.contipay.co.zw',
  PROVIDER_CODES: {
    ecocash:    'EC',
    onemoney:   'OM',
    innbucks:   'IB',
    omari:      'OMA',
    zipit:      'ZP',
    visa:       'VIS',
    mastercard: 'MC',
  },
};

module.exports = {
  CATEGORY_TYPE,
  VEHICLE_TYPE,
  VEHICLE_RANK,
  VEHICLE_MAX_KG,
  VEHICLE_META,
  VEHICLE_LADDER,
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  CURRENCY,
  USER_ROLE,
  CITY,
  WEIGHT_THRESHOLD,
  JWT,
  CONTIPAY,
};
