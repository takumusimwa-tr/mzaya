const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const LiquidityForecastVersion = sequelize.define('LiquidityForecastVersion', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  forecast_reference: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  version_number: { type: DataTypes.INTEGER, allowNull: false },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  forecast_start: { type: DataTypes.DATEONLY, allowNull: false },
  forecast_end: { type: DataTypes.DATEONLY, allowNull: false },
  assumptions: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  forecast_data: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'draft' },
  created_by: { type: DataTypes.UUID, allowNull: true },
  approved_by: { type: DataTypes.UUID, allowNull: true },
  approved_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'liquidity_forecast_versions',
  underscored: true,
  timestamps: true,
});

module.exports = LiquidityForecastVersion;
