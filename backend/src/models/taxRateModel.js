const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TaxRate = sequelize.define('TaxRate', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  jurisdiction_id: { type: DataTypes.UUID, allowNull: false },
  tax_type: { type: DataTypes.STRING(40), allowNull: false },
  name: { type: DataTypes.STRING(120), allowNull: false },
  rate_basis_points: { type: DataTypes.INTEGER, allowNull: false },
  applies_to: { type: DataTypes.STRING(40), allowNull: false, defaultValue: 'platform_fee' },
  effective_from: { type: DataTypes.DATEONLY, allowNull: false },
  effective_to: { type: DataTypes.DATEONLY, allowNull: true },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active' },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'tax_rates',
  underscored: true,
  timestamps: true,
});

module.exports = TaxRate;
