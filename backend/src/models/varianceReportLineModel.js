const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const VarianceReportLine = sequelize.define('VarianceReportLine', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  variance_report_id: { type: DataTypes.UUID, allowNull: false },
  period_code: { type: DataTypes.STRING(20), allowNull: false },
  account_id: { type: DataTypes.UUID, allowNull: true },
  department_code: { type: DataTypes.STRING(60), allowNull: true },
  cost_center_code: { type: DataTypes.STRING(60), allowNull: true },
  actual_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  comparator_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  variance_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  variance_ratio: { type: DataTypes.DECIMAL(12, 6), allowNull: true },
  favorable: { type: DataTypes.BOOLEAN, allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'finance_variance_report_lines',
  underscored: true,
  timestamps: false,
  createdAt: 'created_at',
});

module.exports = VarianceReportLine;
