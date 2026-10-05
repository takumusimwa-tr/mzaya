const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');


module.exports = sequelize.define('FinanceDomainReconciliationSnapshot', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  snapshot_reference: { type: DataTypes.STRING(140), allowNull: false, unique: true },
  domain_key: { type: DataTypes.STRING(80), allowNull: false },
  snapshot_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  total_records: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  matched_records: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  exception_records: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  pending_records: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  stale_records: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  match_rate: { type: DataTypes.DECIMAL(8, 4), allowNull: true },
  oldest_exception_age_seconds: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  health_status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'healthy' },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, { tableName: 'finance_domain_reconciliation_snapshots', underscored: true, timestamps: false });
