const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
module.exports = sequelize.define('CostAllocationRun', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }, run_reference: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  period_code: { type: DataTypes.STRING(20), allowNull: false }, currency: { type: DataTypes.STRING(3), allowNull: false },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'pending' }, total_source_cost_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  total_allocated_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 }, started_by: DataTypes.UUID, started_at: DataTypes.DATE,
  completed_at: DataTypes.DATE, error_message: DataTypes.STRING(1000), metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, { tableName: 'cost_allocation_runs', underscored: true, timestamps: true });
