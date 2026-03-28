const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const OrderMaterials = sequelize.define('OrderMaterials', {
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

  // Which supplier / hardware store
  supplier_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  supplier_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  // Items — e.g. [{ name: 'Cement 50kg bag', qty: 10, unit_price_usd: 8.00 }]
  items: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
  },

  // Weight drives vehicle assignment (bike/bakkie/truck)
  total_weight_kg: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },

  // Auto-set by dispatch service based on weight
  requires_truck: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  requires_bakkie: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  // Does the customer need offloading help?
  offloading_required: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  special_instructions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

}, {
  tableName: 'order_materials_details',
  timestamps: true,
});

module.exports = OrderMaterials;