const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SettlementAdjustment = sequelize.define('SettlementAdjustment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  owner_type: { type: DataTypes.STRING(20), allowNull: false },
  owner_id: { type: DataTypes.UUID, allowNull: false },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  amount_minor: { type: DataTypes.BIGINT, allowNull: false },
  adjustment_type: { type: DataTypes.STRING(40), allowNull: false },
  reason: { type: DataTypes.STRING(500), allowNull: false },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'pending' },
  created_by: { type: DataTypes.UUID, allowNull: true },
  applied_settlement_id: { type: DataTypes.UUID, allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'settlement_adjustments',
  underscored: true,
  timestamps: true,
});

module.exports = SettlementAdjustment;
