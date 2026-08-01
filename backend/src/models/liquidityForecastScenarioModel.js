const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const LiquidityForecastScenario = sequelize.define('LiquidityForecastScenario', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  scenario_key: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(160), allowNull: false },
  scenario_type: { type: DataTypes.STRING(30), allowNull: false },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active' },
  assumptions: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  created_by: { type: DataTypes.UUID, allowNull: true },
}, {
  tableName: 'liquidity_forecast_scenarios',
  underscored: true,
  timestamps: true,
});

module.exports = LiquidityForecastScenario;
