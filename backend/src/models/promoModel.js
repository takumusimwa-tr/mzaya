const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Promo = sequelize.define('Promo', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  // The code the customer types, stored uppercase (e.g. 'MZAYA20')
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  // Discount type: 'percent' | 'fixed' | 'free_delivery'
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  // For 'percent': the percentage (e.g. 20 = 20% off).
  // For 'fixed':   the dollar amount off (e.g. 2 = $2 off).
  // For 'free_delivery': ignored.
  value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },

  // Minimum order subtotal (USD) required to use the code. 0 = no minimum.
  min_order_usd: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },

  // Cap the discount (USD) for percent codes. null = uncapped.
  max_discount_usd: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },

  // Total times this code may be used across all customers. null = unlimited.
  usage_limit: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  // How many times it has been used so far.
  used_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },

  // Optional expiry — after this datetime the code is invalid.
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  // Admin on/off switch.
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'promos',
  timestamps: true,
});

module.exports = Promo;
