const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');


module.exports = sequelize.define('FinanceCrossDomainReconciliationRun', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  run_reference: { type: DataTypes.STRING(140), allowNull: false, unique: true },
  started_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  completed_at: { type: DataTypes.DATE, allowNull: true },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'running' },
  domain_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  exception_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  blocking_exception_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  summary: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  initiated_by: { type: DataTypes.UUID, allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, { tableName: 'finance_cross_domain_reconciliation_runs', underscored: true, timestamps: false });
