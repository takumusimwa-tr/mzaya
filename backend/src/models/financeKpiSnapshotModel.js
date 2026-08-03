const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

module.exports = sequelize.define('FinanceKpiSnapshot', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  kpi_definition_id: { type: DataTypes.UUID, allowNull: false },
  snapshot_date: { type: DataTypes.DATEONLY, allowNull: false },
  period_type: { type: DataTypes.STRING(20), allowNull: false },
  period_key: { type: DataTypes.STRING(30), allowNull: false },
  currency: { type: DataTypes.STRING(3), allowNull: true },
  dimension_type: { type: DataTypes.STRING(40), allowNull: true },
  dimension_value: { type: DataTypes.STRING(160), allowNull: true },
  value: { type: DataTypes.DECIMAL(24, 8), allowNull: false },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'normal' },
  source_lineage: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
  calculated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'finance_kpi_snapshots',
  underscored: true,
  timestamps: false,
  createdAt: 'created_at',
});
