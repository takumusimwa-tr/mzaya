const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TaxReturn = sequelize.define('TaxReturn', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  filing_period_id: { type: DataTypes.UUID, allowNull: false },
  registration_id: { type: DataTypes.UUID, allowNull: false },
  return_reference: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'draft' },
  taxable_sales_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  output_tax_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  input_tax_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  adjustments_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  net_tax_due_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  prepared_by: { type: DataTypes.UUID, allowNull: true },
  approved_by: { type: DataTypes.UUID, allowNull: true },
  submitted_by: { type: DataTypes.UUID, allowNull: true },
  prepared_at: { type: DataTypes.DATE, allowNull: true },
  approved_at: { type: DataTypes.DATE, allowNull: true },
  submitted_at: { type: DataTypes.DATE, allowNull: true },
  submission_reference: { type: DataTypes.STRING(180), allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'tax_returns',
  underscored: true,
  timestamps: true,
});

module.exports = TaxReturn;
