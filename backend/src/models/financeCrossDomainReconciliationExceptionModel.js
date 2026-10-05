const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');


module.exports = sequelize.define('FinanceCrossDomainReconciliationException', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  run_id: { type: DataTypes.UUID, allowNull: false },
  domain_key: { type: DataTypes.STRING(80), allowNull: false },
  exception_code: { type: DataTypes.STRING(120), allowNull: false },
  severity: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'error' },
  source_record_id: { type: DataTypes.UUID, allowNull: true },
  message: { type: DataTypes.STRING(1500), allowNull: false },
  evidence: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'open' },
  owner_user_id: { type: DataTypes.UUID, allowNull: true },
  resolved_at: { type: DataTypes.DATE, allowNull: true },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, { tableName: 'finance_cross_domain_reconciliation_exceptions', underscored: true, timestamps: false });
