const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const LiquiditySnapshot = sequelize.define('LiquiditySnapshot', {
  snapshot_date: { type: DataTypes.DATEONLY, allowNull: false, primaryKey: true },
  currency: { type: DataTypes.STRING(3), allowNull: false, primaryKey: true },
  total_cash_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  available_cash_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  restricted_cash_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  pending_outflows_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  forecast_inflows_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  forecast_outflows_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  runway_days: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'liquidity_snapshots',
  underscored: true,
  timestamps: true,
});

module.exports = LiquiditySnapshot;
