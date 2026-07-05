const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const MenuItem = sequelize.define('MenuItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  vendor_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  price_usd: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },

  // Weight in kg — used for vehicle assignment on grocery/materials
  weight_kg: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    defaultValue: 0,
  },

  category: {
    type: DataTypes.STRING,
    allowNull: true, // e.g. 'Burgers', 'Drinks', 'Cement', 'Grain'
  },

  image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },

  // Preparation lead time in minutes — how long before this item is ready.
  // Drives "Ready in ~X min" and the minimum scheduling window.
  prep_minutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },

}, {
  tableName: 'menu_items',
  timestamps: true,
});

module.exports = MenuItem;