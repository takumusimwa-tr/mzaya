const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const OrderFood = sequelize.define('OrderFood', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  order_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true, // one food detail per order
  },

  // Which restaurant
  restaurant_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  restaurant_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  // Items ordered — stored as JSONB array
  // e.g. [{ name: 'Sadza & Stew', qty: 2, unit_price_usd: 3.50 }]
  items: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
  },

  special_instructions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  estimated_prep_minutes: {
    type: DataTypes.INTEGER,
    allowNull: true, // set by restaurant on acceptance
  },

}, {
  tableName: 'order_food_details',
  timestamps: true,
});

module.exports = OrderFood;