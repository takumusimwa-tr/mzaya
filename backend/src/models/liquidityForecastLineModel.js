const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const LiquidityForecastLine = sequelize.define('LiquidityForecastLine', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  forecast_version_id: { type: DataTypes.UUID, allowNull: false },
  scenario_id: { type: DataTypes.UUID, allowNull: true },
  forecast_date: { type: DataTypes.DATEONLY, allowNull: false },
  line_type: { type: DataTypes.STRING(40), allowNull: false },
  source_type: { type: DataTypes.STRING(60), allowNull: true },
  source_id: { type: DataTypes.UUID, allowNull: true },
  inflow_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  outflow_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  net_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  confidence_ratio: { type: DataTypes.DECIMAL(8, 4), allowNull: false, defaultValue: 1 },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'liquidity_forecast_lines',
  underscored: true,
  timestamps: false,
  createdAt: 'created_at',
});

module.exports = LiquidityForecastLine;
