const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TrialBalanceLine = sequelize.define('TrialBalanceLine', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  snapshot_id: { type: DataTypes.UUID, allowNull: false },
  account_id: { type: DataTypes.UUID, allowNull: false },
  account_code: { type: DataTypes.STRING(80), allowNull: true },
  account_name: { type: DataTypes.STRING(180), allowNull: true },
  account_type: { type: DataTypes.STRING(60), allowNull: true },
  debit_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  credit_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  net_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
}, {
  tableName: 'trial_balance_lines',
  underscored: true,
  timestamps: false,
  createdAt: 'created_at',
});

module.exports = TrialBalanceLine;
