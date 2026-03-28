const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const OrderGrocery = sequelize.define('OrderGrocery', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  order_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },

  // Which store
  store_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  store_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  // Items — e.g. [{ name: 'Roller Meal 10kg', qty: 1, unit_price_usd: 4.20 }]
  items: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
  },

  // Total weight determines vehicle assignment
  total_weight_kg: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
  },

  // If an item is unavailable, can the rider substitute?
  substitution_allowed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  special_instructions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

}, {
  tableName: 'order_grocery_details',
  timestamps: true,
});

module.exports = OrderGrocery;