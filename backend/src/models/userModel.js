const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  email: {
    type: DataTypes.STRING,
    allowNull: true, // not everyone in Zim has email — phone is primary
    unique: true,
    validate: {
      isEmail: true,
    },
  },

  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  role: {
    type: DataTypes.ENUM('customer', 'rider', 'vendor', 'admin'),
    defaultValue: 'customer',
  },

  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  city_id: {
    type: DataTypes.UUID,
    allowNull: true, // set when user registers, used to scope riders to cities
  },

  location: {
    type: DataTypes.JSONB, // { lat, lng } — JSONB lets you query coordinates later
    allowNull: true,
  },

}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;