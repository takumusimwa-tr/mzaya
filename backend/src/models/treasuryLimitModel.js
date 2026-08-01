const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TreasuryLimit = sequelize.define('TreasuryLimit', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  limit_key: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  limit_type: { type: DataTypes.STRING(60), allowNull: false },
  currency: { type: DataTypes.STRING(3), allowNull: true },
  threshold_minor: { type: DataTypes.BIGINT, allowNull: true },
  threshold_ratio: { type: DataTypes.DECIMAL(10, 4), allowNull: true },
  severity: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'warning' },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active' },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'treasury_limits',
  underscored: true,
  timestamps: true,
});

module.exports = TreasuryLimit;
