const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');


module.exports = sequelize.define('FinanceCutoverControl', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  control_key: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(180), allowNull: false },
  description: { type: DataTypes.STRING(1200), allowNull: true },
  domain_key: { type: DataTypes.STRING(80), allowNull: true },
  current_mode: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'legacy' },
  target_mode: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'event_engine' },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'planned' },
  effective_at: { type: DataTypes.DATE, allowNull: true },
  activated_by: { type: DataTypes.UUID, allowNull: true },
  activated_at: { type: DataTypes.DATE, allowNull: true },
  rolled_back_by: { type: DataTypes.UUID, allowNull: true },
  rolled_back_at: { type: DataTypes.DATE, allowNull: true },
  rollback_reason: { type: DataTypes.STRING(1200), allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, { tableName: 'finance_cutover_controls', underscored: true, timestamps: true });
