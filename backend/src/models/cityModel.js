const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const City = sequelize.define('City', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // e.g. 'harare', 'bulawayo'
  },

  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },

  // Bounding box for city zone validation
  bounds: {
    type: DataTypes.JSONB,
    allowNull: true,
    // { north, south, east, west } lat/lng bounds
  },

  // Center coordinates for distance calculations
  center: {
    type: DataTypes.JSONB,
    allowNull: true,
    // { lat, lng }
  },

}, {
  tableName: 'cities',
  timestamps: true,
});

module.exports = City;