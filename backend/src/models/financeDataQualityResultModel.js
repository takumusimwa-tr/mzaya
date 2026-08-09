const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

module.exports = sequelize.define('FinanceDataQualityResult', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  run_reference: { type: DataTypes.STRING(120), allowNull: false },
  rule_id: { type: DataTypes.UUID, allowNull: false },
  domain_id: { type: DataTypes.UUID, allowNull: true },
  record_id: { type: DataTypes.UUID, allowNull: true },
  result: { type: DataTypes.STRING(20), allowNull: false },
  issue_code: { type: DataTypes.STRING(100), allowNull: true },
  issue_message: { type: DataTypes.STRING(1500), allowNull: true },
  detected_value: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  evaluated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },

}, { tableName: 'finance_data_quality_results', underscored: true, timestamps: true });
