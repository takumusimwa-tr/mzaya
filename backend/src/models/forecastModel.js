const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Forecast = sequelize.define('Forecast', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  forecast_code: { type: DataTypes.STRING(80), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(180), allowNull: false },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  forecast_type: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'rolling' },
  horizon_months: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 12 },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'active' },
  created_by: { type: DataTypes.UUID, allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'finance_forecasts',
  underscored: true,
  timestamps: true,
});

module.exports = Forecast;
