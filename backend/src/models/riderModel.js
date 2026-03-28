const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { VEHICLE_TYPE } = require('../config/constants');

const Rider = sequelize.define('Rider', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  // Linked to the user account
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },

  city_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  // Vehicle details
  vehicle_type: {
    type: DataTypes.STRING,
    allowNull: false,
    // bike / bakkie / truck
  },

  vehicle_plate: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  vehicle_model: {
    type: DataTypes.STRING,
    allowNull: true, // e.g. 'Honda CB125', 'Toyota Hilux'
  },

  // National ID for KYC
  national_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  // Current GPS location (updated by rider app)
  current_location: {
    type: DataTypes.JSONB,
    allowNull: true, // { lat, lng, updated_at }
  },

  // Is the rider online and accepting orders?
  is_online: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  // Admin approved this rider
  is_approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  // Earnings tracking
  total_deliveries: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  total_earnings_usd: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },

  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00,
  },

}, {
  tableName: 'riders',
  timestamps: true,
});

module.exports = Rider;