const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// A Brand is what the customer sees and browses (e.g. "Chicken Inn", "Halsteds").
// Physical locations are Branches (the vendors table), each linked to a Brand.
const Brand = sequelize.define('Brand', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  // The user account that owns this brand (the chain owner).
  owner_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  // food / grocery / materials — the brand's vertical.
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  logo_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  cover_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  // Admin approval gate for the whole brand.
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00,
  },
}, {
  tableName: 'brands',
  timestamps: true,
});

module.exports = Brand;
