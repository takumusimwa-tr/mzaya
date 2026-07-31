const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CommunicationDailyMetric = sequelize.define('CommunicationDailyMetric', {
  metric_date: { type: DataTypes.DATEONLY, allowNull: false, primaryKey: true },
  metric_key: { type: DataTypes.STRING(80), allowNull: false, primaryKey: true },
  dimension: { type: DataTypes.STRING(80), allowNull: false, defaultValue: 'all', primaryKey: true },
  value_numeric: { type: DataTypes.DECIMAL(18, 4), allowNull: false, defaultValue: 0 },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'communication_daily_metrics',
  underscored: true,
  timestamps: true,
});

module.exports = CommunicationDailyMetric;
