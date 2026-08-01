const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TreasuryAlert = sequelize.define('TreasuryAlert', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  limit_id: { type: DataTypes.UUID, allowNull: true },
  alert_type: { type: DataTypes.STRING(60), allowNull: false },
  severity: { type: DataTypes.STRING(20), allowNull: false },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'open' },
  title: { type: DataTypes.STRING(220), allowNull: false },
  description: { type: DataTypes.STRING(1500), allowNull: true },
  resource_type: { type: DataTypes.STRING(60), allowNull: true },
  resource_id: { type: DataTypes.UUID, allowNull: true },
  detected_value: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  detected_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  acknowledged_by: { type: DataTypes.UUID, allowNull: true },
  acknowledged_at: { type: DataTypes.DATE, allowNull: true },
  resolved_by: { type: DataTypes.UUID, allowNull: true },
  resolved_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'treasury_alerts',
  underscored: true,
  timestamps: true,
});

module.exports = TreasuryAlert;
