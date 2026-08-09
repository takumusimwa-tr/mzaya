const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

module.exports = sequelize.define('TaxLiability', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  liability_reference: { type: DataTypes.STRING(140), allowNull: false, unique: true },
  jurisdiction_code: { type: DataTypes.STRING(40), allowNull: true },
  tax_code: { type: DataTypes.STRING(80), allowNull: false },
  tax_type: { type: DataTypes.STRING(60), allowNull: false },
  period_key: { type: DataTypes.STRING(30), allowNull: false },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  opening_balance_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  tax_accrued_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  adjustments_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  tax_paid_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  closing_balance_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'open' },
  due_at: { type: DataTypes.DATE, allowNull: true },
  closed_at: { type: DataTypes.DATE, allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },

}, {
  tableName: 'tax_liabilities',
  underscored: true,
  timestamps: true,
});
