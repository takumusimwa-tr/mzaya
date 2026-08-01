const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const VarianceReport = sequelize.define('VarianceReport', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  report_reference: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  report_type: { type: DataTypes.STRING(40), allowNull: false },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  period_from: { type: DataTypes.STRING(20), allowNull: false },
  period_to: { type: DataTypes.STRING(20), allowNull: false },
  budget_version_id: { type: DataTypes.UUID, allowNull: true },
  forecast_version_id: { type: DataTypes.UUID, allowNull: true },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'generated' },
  generated_by: { type: DataTypes.UUID, allowNull: true },
  generated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'finance_variance_reports',
  underscored: true,
  timestamps: false,
  createdAt: 'created_at',
});

module.exports = VarianceReport;
