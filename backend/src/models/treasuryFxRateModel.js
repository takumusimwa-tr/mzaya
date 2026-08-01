const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TreasuryFxRate = sequelize.define('TreasuryFxRate', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  base_currency: { type: DataTypes.STRING(3), allowNull: false },
  quote_currency: { type: DataTypes.STRING(3), allowNull: false },
  rate: { type: DataTypes.DECIMAL(20, 8), allowNull: false },
  source: { type: DataTypes.STRING(60), allowNull: false },
  rate_type: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'spot' },
  effective_at: { type: DataTypes.DATE, allowNull: false },
  expires_at: { type: DataTypes.DATE, allowNull: true },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active' },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'treasury_fx_rates',
  underscored: true,
  timestamps: true,
});

module.exports = TreasuryFxRate;
