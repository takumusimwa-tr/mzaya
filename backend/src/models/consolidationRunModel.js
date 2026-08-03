const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ConsolidationRun = sequelize.define('ConsolidationRun', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  consolidation_group_id: { type: DataTypes.UUID, allowNull: false },
  run_reference: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  period_code: { type: DataTypes.STRING(20), allowNull: false },
  reporting_currency: { type: DataTypes.STRING(3), allowNull: false },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'pending' },
  started_by: { type: DataTypes.UUID, allowNull: true },
  started_at: { type: DataTypes.DATE, allowNull: true },
  completed_at: { type: DataTypes.DATE, allowNull: true },
  failed_at: { type: DataTypes.DATE, allowNull: true },
  error_message: { type: DataTypes.STRING(1000), allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'consolidation_runs',
  underscored: true,
  timestamps: true,
});

module.exports = ConsolidationRun;
