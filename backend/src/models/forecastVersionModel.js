const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ForecastVersion = sequelize.define('ForecastVersion', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  forecast_id: { type: DataTypes.UUID, allowNull: false },
  version_number: { type: DataTypes.INTEGER, allowNull: false },
  scenario: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'base' },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'draft' },
  assumptions: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  created_by: { type: DataTypes.UUID, allowNull: true },
  approved_by: { type: DataTypes.UUID, allowNull: true },
  approved_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'finance_forecast_versions',
  underscored: true,
  timestamps: true,
});

module.exports = ForecastVersion;
