const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const WithholdingTaxRecord = sequelize.define('WithholdingTaxRecord', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  jurisdiction_id: { type: DataTypes.UUID, allowNull: false },
  payee_type: { type: DataTypes.STRING(30), allowNull: false },
  payee_id: { type: DataTypes.UUID, allowNull: false },
  source_type: { type: DataTypes.STRING(40), allowNull: false },
  source_id: { type: DataTypes.UUID, allowNull: true },
  gross_minor: { type: DataTypes.BIGINT, allowNull: false },
  rate_basis_points: { type: DataTypes.INTEGER, allowNull: false },
  withheld_minor: { type: DataTypes.BIGINT, allowNull: false },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  certificate_number: { type: DataTypes.STRING(100), allowNull: true },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'calculated' },
  withheld_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  remitted_at: { type: DataTypes.DATE, allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'withholding_tax_records',
  underscored: true,
  timestamps: true,
});

module.exports = WithholdingTaxRecord;
