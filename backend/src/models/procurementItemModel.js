const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

module.exports = sequelize.define('ProcurementItem', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  procurement_id: { type: DataTypes.UUID, allowNull: false },
  item_reference: { type: DataTypes.STRING(140), allowNull: true },
  description: { type: DataTypes.STRING(300), allowNull: true },
  quantity: { type: DataTypes.DECIMAL(18, 4), allowNull: false, defaultValue: 1 },
  unit_cost_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  total_cost_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  vendor_id: { type: DataTypes.UUID, allowNull: true },
  tax_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  discount_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'procurement_items',
  underscored: true,
  timestamps: false,
  createdAt: 'created_at',
});
