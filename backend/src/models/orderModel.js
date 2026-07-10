const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const {
  CATEGORY_TYPE,
  ORDER_STATUS,
  VEHICLE_TYPE,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  CURRENCY,
  CITY,
} = require('../config/constants');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  // Who placed the order
  customer_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  // Which city this order is in
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  // What kind of order
  category_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  // Order lifecycle
  status: {
    type: DataTypes.STRING,
    defaultValue: ORDER_STATUS.PENDING,
  },

  // When set, this is a scheduled order to be released for dispatch at this time.
  scheduled_for: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  // Delivery addresses
  pickup_address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pickup_location: {
    type: DataTypes.JSONB, // { lat, lng }
    allowNull: true,
  },
  dropoff_address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dropoff_location: {
    type: DataTypes.JSONB, // { lat, lng }
    allowNull: true,
  },
  dropoff_landmark: {
    type: DataTypes.STRING, // human cue for unstructured ZW addresses, e.g. "blue gate opposite Total"
    allowNull: true,
  },

  // Vehicle assigned for this order
  vehicle_type: {
    type: DataTypes.STRING,
    allowNull: true, // set by dispatch service
  },

  // Rider assigned
  rider_id: {
    type: DataTypes.UUID,
    allowNull: true, // null until a rider accepts
  },

  // Pricing — always store in USD, display ZiG at checkout
  subtotal_usd: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  delivery_fee_usd: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },

  // ── Fare negotiation (materials/errands, inDrive-style) ──────────────────
  // Whether this order is open for fare bargaining.
  is_negotiable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // The fare the customer initially offered.
  offered_fare_usd: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  // The fare finally agreed (what the rider gets paid for the delivery).
  agreed_fare_usd: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  tip_usd: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0, // voluntary rider tip — 100% to rider, no commission
  },
  promo_code: {
    type: DataTypes.STRING,
    allowNull: true, // code applied, if any
  },
  discount_usd: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0, // promo discount off subtotal+fee (never off tip)
  },
  total_usd: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },

  // ZiG equivalent at time of order (snapshot — rates change daily)
  zig_rate_snapshot: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: true, // USD to ZiG rate at time of order
  },
  total_zig: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: true,
  },

  // Payment
  payment_method: {
    type: DataTypes.STRING,
    allowNull: true, // set when customer checks out
  },
  payment_status: {
    type: DataTypes.STRING,
    defaultValue: PAYMENT_STATUS.PENDING,
  },
  payment_reference: {
    type: DataTypes.STRING,
    allowNull: true, // ContiPay reference ID
  },
  currency_paid: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  // Timestamps for order lifecycle tracking
  accepted_at:  { type: DataTypes.DATE, allowNull: true },
  picked_up_at: { type: DataTypes.DATE, allowNull: true },
  delivered_at: { type: DataTypes.DATE, allowNull: true },
  cancelled_at: { type: DataTypes.DATE, allowNull: true },

  // Proof-of-delivery photo (uploaded by the rider at drop-off).
  delivery_proof_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  // Optional cancellation reason
  cancel_reason: {
    type: DataTypes.STRING,
    allowNull: true,
  },

}, {
  tableName: 'orders',
  timestamps: true,
});

module.exports = Order;