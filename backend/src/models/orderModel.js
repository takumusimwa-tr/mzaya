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
    type: DataTypes.ENUM(...Object.values(CITY)),
    allowNull: false,
  },

  // What kind of order
  category_type: {
    type: DataTypes.ENUM(...Object.values(CATEGORY_TYPE)),
    allowNull: false,
  },

  // Order lifecycle
  status: {
    type: DataTypes.ENUM(...Object.values(ORDER_STATUS)),
    defaultValue: ORDER_STATUS.PENDING,
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

  // Vehicle assigned for this order
  vehicle_type: {
    type: DataTypes.ENUM(...Object.values(VEHICLE_TYPE)),
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
    type: DataTypes.ENUM(...Object.values(PAYMENT_METHOD)),
    allowNull: true, // set when customer checks out
  },
  payment_status: {
    type: DataTypes.ENUM(...Object.values(PAYMENT_STATUS)),
    defaultValue: PAYMENT_STATUS.PENDING,
  },
  payment_reference: {
    type: DataTypes.STRING,
    allowNull: true, // ContiPay reference ID
  },
  currency_paid: {
    type: DataTypes.ENUM(...Object.values(CURRENCY)),
    allowNull: true,
  },

  // Timestamps for order lifecycle tracking
  accepted_at:  { type: DataTypes.DATE, allowNull: true },
  picked_up_at: { type: DataTypes.DATE, allowNull: true },
  delivered_at: { type: DataTypes.DATE, allowNull: true },
  cancelled_at: { type: DataTypes.DATE, allowNull: true },

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