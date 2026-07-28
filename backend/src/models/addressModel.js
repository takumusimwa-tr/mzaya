const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// A customer's saved delivery address. Like favorites, the controllers hit an
// `addresses` table via raw SQL but there was never a model for it — so sync()
// never created the table on a fresh database, and the first "save address" would
// 500 with "relation addresses does not exist". This model defines the table so
// sync({ alter: true }) builds it. Columns match address.controller.js exactly.
const Address = sequelize.define('Address', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  customer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    // FK to users(id) — wired in associations.js
  },

  label: {
    type: DataTypes.STRING,
    allowNull: false,
    // e.g. "Home", "Work"
  },

  address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    // e.g. "gate code 1234, blue door"
  },

  location: {
    type: DataTypes.JSONB,
    allowNull: true,
    // { lat, lng } — stored as JSON by the controller
  },

  is_default: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: 'addresses',
  timestamps: true,   // createdAt / updatedAt (the raw SQL sets both)
  indexes: [
    { fields: ['customer_id'] },
  ],
});

module.exports = Address;
