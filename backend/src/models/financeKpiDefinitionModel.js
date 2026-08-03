const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

module.exports = sequelize.define('FinanceKpiDefinition', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  kpi_key: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(180), allowNull: false },
  category: { type: DataTypes.STRING(60), allowNull: false },
  description: { type: DataTypes.STRING(1000), allowNull: true },
  formula_version: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  unit: { type: DataTypes.STRING(30), allowNull: false },
  aggregation_method: { type: DataTypes.STRING(40), allowNull: false },
  data_sources: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
  owner_id: { type: DataTypes.UUID, allowNull: true },
  target_value: { type: DataTypes.DECIMAL(24, 8), allowNull: true },
  warning_threshold: { type: DataTypes.DECIMAL(24, 8), allowNull: true },
  critical_threshold: { type: DataTypes.DECIMAL(24, 8), allowNull: true },
  favorable_direction: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'higher' },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active' },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'finance_kpi_definitions',
  underscored: true,
  timestamps: true,
});
