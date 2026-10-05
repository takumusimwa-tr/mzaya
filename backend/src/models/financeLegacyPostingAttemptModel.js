const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');


module.exports = sequelize.define('FinanceLegacyPostingAttempt', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  attempt_reference: { type: DataTypes.STRING(140), allowNull: false, unique: true },
  source_module: { type: DataTypes.STRING(80), allowNull: false },
  source_action: { type: DataTypes.STRING(120), allowNull: true },
  source_record_id: { type: DataTypes.UUID, allowNull: true },
  attempted_by: { type: DataTypes.UUID, allowNull: true },
  attempted_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  cutover_control_id: { type: DataTypes.UUID, allowNull: true },
  result: { type: DataTypes.STRING(30), allowNull: false },
  message: { type: DataTypes.STRING(1500), allowNull: true },
  payload: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, { tableName: 'finance_legacy_posting_attempts', underscored: true, timestamps: false });
