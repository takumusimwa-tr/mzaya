// ─── Order categories ─────────────────────────────────────────────────────────
const CATEGORY_TYPE = {
  FOOD:      'food',
  GROCERY:   'grocery',
  MATERIALS: 'materials',
  ERRAND:    'errand',
};

// ─── Vehicle types ────────────────────────────────────────────────────────────
const VEHICLE_TYPE = {
  BIKE:   'bike',    // food, errands, light grocery (<20kg)
  BAKKIE: 'bakkie',  // bulk grocery, medium materials (20–500kg)
  TRUCK:  'truck',   // heavy building materials (>500kg)
};

// ─── Order lifecycle statuses ─────────────────────────────────────────────────
const ORDER_STATUS = {
  PENDING:   'pending',    // placed, awaiting rider
  ACCEPTED:  'accepted',   // rider accepted
  PICKED_UP: 'picked_up',  // rider collected order
  EN_ROUTE:  'en_route',   // heading to customer
  DELIVERED: 'delivered',  // completed
  CANCELLED: 'cancelled',  // cancelled by customer or system
  FAILED:    'failed',     // could not be fulfilled
};

// ─── Payment methods (all digital — no cash) ──────────────────────────────────
// All routed through ContiPay gateway (contipay.co.zw)
const PAYMENT_METHOD = {
  ECOCASH:   'ecocash',    // Econet mobile money — largest ZW user base
  ONEMONEY:  'onemoney',   // NetOne mobile money
  INNBUCKS:  'innbucks',   // InnBucks wallet — fast growing
  OMARI:     'omari',      // O'Mari wallet
  ZIPIT:     'zipit',      // Bank-to-bank via Zimswitch (USD)
  VISA:      'visa',       // Visa card (USD)
  MASTERCARD:'mastercard', // Mastercard (USD)
};

// ─── Currency ─────────────────────────────────────────────────────────────────
const CURRENCY = {
  USD: 'usd',  // base currency — all prices stored in USD
  ZIG: 'zig',  // Zimbabwe Gold — displayed at checkout using live RBZ rate
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

// ─── Vehicle weight thresholds (kg) ──────────────────────────────────────────
const WEIGHT_THRESHOLD = {
  BIKE_MAX:   20,   // up to 20kg   → bike
  BAKKIE_MAX: 500,  // 20–500kg     → bakkie
                    // above 500kg  → truck
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
  // Provider codes used in ContiPay API payloads
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