const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TaxJurisdiction = sequelize.define('TaxJurisdiction', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  code: { type: DataTypes.STRING(40), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(120), allowNull: false },
  country_code: { type: DataTypes.STRING(2), allowNull: false },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active' },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'tax_jurisdictions',
  underscored: true,
  timestamps: true,
});

module.exports = TaxJurisdiction;
