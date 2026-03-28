const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { CATEGORY_TYPE } = require('../config/constants');

const Vendor = sequelize.define('Vendor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  // The user account that owns this vendor
  owner_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  city_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  // What category this vendor serves
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    // food / grocery / materials
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  location: {
    type: DataTypes.JSONB,
    allowNull: true, // { lat, lng }
  },

  // Opening hours e.g. { mon: '08:00-22:00', tue: '08:00-22:00', ... }
  opening_hours: {
    type: DataTypes.JSONB,
    allowNull: true,
  },

  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // admin must approve before going live
  },

  is_open: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // vendor toggles this themselves
  },

  logo_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  // Average rating (updated on each review)
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00,
  },

  total_orders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

}, {
  tableName: 'vendors',
  timestamps: true,
});

module.exports = Vendor;