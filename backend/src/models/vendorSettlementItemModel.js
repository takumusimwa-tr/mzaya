const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

module.exports = sequelize.define('VendorSettlementItem', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  settlement_id: { type: DataTypes.UUID, allowNull: false },
  order_id: { type: DataTypes.UUID, allowNull: true },
  order_type: { type: DataTypes.STRING(40), allowNull: true },
  gross_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  refund_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  commission_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  tax_withheld_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  adjustment_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  net_due_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'vendor_settlement_items',
  underscored: true,
  timestamps: false,
  createdAt: 'created_at',
});
