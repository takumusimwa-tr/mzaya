const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TrialBalanceSnapshot = sequelize.define('TrialBalanceSnapshot', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  close_cycle_id: { type: DataTypes.UUID, allowNull: false },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  snapshot_type: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'pre_close' },
  total_debits_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  total_credits_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  balanced: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  generated_by: { type: DataTypes.UUID, allowNull: true },
  generated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'trial_balance_snapshots',
  underscored: true,
  timestamps: false,
  createdAt: 'created_at',
});

module.exports = TrialBalanceSnapshot;
