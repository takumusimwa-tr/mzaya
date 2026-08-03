const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
module.exports = sequelize.define('RevenueRecognitionRule', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  rule_key: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  revenue_type: { type: DataTypes.STRING(50), allowNull: false },
  trigger_event: { type: DataTypes.STRING(80), allowNull: false },
  recognition_method: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'point_in_time' },
  ledger_account_id: { type: DataTypes.UUID, allowNull: true },
  deferred_account_id: { type: DataTypes.UUID, allowNull: true },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active' },
  effective_from: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  effective_to: { type: DataTypes.DATE, allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, { tableName: 'revenue_recognition_rules', underscored: true, timestamps: true });
