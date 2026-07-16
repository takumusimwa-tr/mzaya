const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const OrderErrand = sequelize.define('OrderErrand', {
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

  // What does the customer need done?
  task_description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  // e.g. 'ZESA token purchase', 'bank queue', 'ZIMRA form submission'
  task_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  // Where the errand needs to happen
  errand_location: {
    type: DataTypes.STRING,
    allowNull: true, // e.g. "ZIMRA Harare, corner Cnr 8th Ave & Robert Mugabe"
  },
  errand_coordinates: {
    type: DataTypes.JSONB, // { lat, lng }
    allowNull: true,
  },
  // A landmark for the errand end. Coordinates get the Mzaya to the gate; a
  // landmark gets them through it — which in Zimbabwe is most of the problem.
  errand_landmark: {
    type: DataTypes.STRING,
    allowNull: true, // e.g. "3rd floor, entrance behind the bank"
  },

  // Estimated time to complete errand
  estimated_duration_minutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  // Does the agent need to carry documents?
  documents_required: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  document_description: {
    type: DataTypes.TEXT,
    allowNull: true, // what documents the customer will hand over
  },

  // Does the agent need cash float from the customer?
  cash_float_required: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  cash_float_amount_usd: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },

  special_instructions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

}, {
  tableName: 'order_errand_details',
  timestamps: true,
});

module.exports = OrderErrand;