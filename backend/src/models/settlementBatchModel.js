const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SettlementBatch = sequelize.define('SettlementBatch', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  batch_reference: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  owner_type: { type: DataTypes.STRING(20), allowNull: false },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  settlement_date: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'draft' },
  total_gross_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  total_adjustments_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  total_fees_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  total_net_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  item_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  approved_by: { type: DataTypes.UUID, allowNull: true },
  approved_at: { type: DataTypes.DATE, allowNull: true },
  submitted_at: { type: DataTypes.DATE, allowNull: true },
  completed_at: { type: DataTypes.DATE, allowNull: true },
  failed_at: { type: DataTypes.DATE, allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'settlement_batches',
  underscored: true,
  timestamps: true,
});

module.exports = SettlementBatch;
