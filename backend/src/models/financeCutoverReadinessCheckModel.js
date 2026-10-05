const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');


module.exports = sequelize.define('FinanceCutoverReadinessCheck', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  check_reference: { type: DataTypes.STRING(140), allowNull: false, unique: true },
  control_id: { type: DataTypes.UUID, allowNull: false },
  check_key: { type: DataTypes.STRING(120), allowNull: false },
  name: { type: DataTypes.STRING(220), allowNull: false },
  result: { type: DataTypes.STRING(20), allowNull: false },
  severity: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'error' },
  measured_value: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  threshold_value: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  message: { type: DataTypes.STRING(1500), allowNull: true },
  evaluated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, { tableName: 'finance_cutover_readiness_checks', underscored: true, timestamps: false });
