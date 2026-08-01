const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TreasuryFxExposure = sequelize.define('TreasuryFxExposure', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  exposure_date: { type: DataTypes.DATEONLY, allowNull: false },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  exposure_type: { type: DataTypes.STRING(40), allowNull: false },
  source_type: { type: DataTypes.STRING(60), allowNull: true },
  source_id: { type: DataTypes.UUID, allowNull: true },
  gross_exposure_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  hedged_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  net_exposure_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  reporting_currency: { type: DataTypes.STRING(3), allowNull: false },
  reporting_value_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'open' },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'treasury_fx_exposures',
  underscored: true,
  timestamps: true,
});

module.exports = TreasuryFxExposure;
