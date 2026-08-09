const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

module.exports = sequelize.define('FinancePeriodLock', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  period_key: { type: DataTypes.STRING(30), allowNull: false },
  scope_type: { type: DataTypes.STRING(40), allowNull: false },
  scope_value: { type: DataTypes.STRING(160), allowNull: true },
  currency: { type: DataTypes.STRING(3), allowNull: true },
  lock_type: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'hard' },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active' },
  reason: { type: DataTypes.STRING(1000), allowNull: true },
  locked_by: { type: DataTypes.UUID, allowNull: true },
  locked_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  unlocked_by: { type: DataTypes.UUID, allowNull: true },
  unlocked_at: { type: DataTypes.DATE, allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },

}, { tableName: 'finance_period_locks', underscored: true, timestamps: true });
