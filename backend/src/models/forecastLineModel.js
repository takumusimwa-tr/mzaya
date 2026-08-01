const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ForecastLine = sequelize.define('ForecastLine', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  forecast_version_id: { type: DataTypes.UUID, allowNull: false },
  period_code: { type: DataTypes.STRING(20), allowNull: false },
  account_id: { type: DataTypes.UUID, allowNull: true },
  department_code: { type: DataTypes.STRING(60), allowNull: true },
  cost_center_code: { type: DataTypes.STRING(60), allowNull: true },
  line_type: { type: DataTypes.STRING(40), allowNull: false },
  amount_minor: { type: DataTypes.BIGINT, allowNull: false },
  confidence_ratio: { type: DataTypes.DECIMAL(8, 4), allowNull: false, defaultValue: 1 },
  source_type: { type: DataTypes.STRING(60), allowNull: true },
  source_id: { type: DataTypes.UUID, allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'finance_forecast_lines',
  underscored: true,
  timestamps: false,
  createdAt: 'created_at',
});

module.exports = ForecastLine;
