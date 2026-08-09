const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

module.exports = sequelize.define('TaxTransaction', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  tax_reference: { type: DataTypes.STRING(140), allowNull: false, unique: true },
  source_type: { type: DataTypes.STRING(60), allowNull: false },
  source_id: { type: DataTypes.UUID, allowNull: true },
  source_event_type: { type: DataTypes.STRING(120), allowNull: true },
  jurisdiction_code: { type: DataTypes.STRING(40), allowNull: true },
  tax_code: { type: DataTypes.STRING(80), allowNull: false },
  tax_type: { type: DataTypes.STRING(60), allowNull: false },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  taxable_base_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  tax_rate_bps: { type: DataTypes.INTEGER, allowNull: true },
  tax_amount_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  tax_inclusive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  direction: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'payable' },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'calculated' },
  recognized_at: { type: DataTypes.DATE, allowNull: true },
  reversed_at: { type: DataTypes.DATE, allowNull: true },
  finance_reconciliation_status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'pending' },
  finance_last_reconciled_at: { type: DataTypes.DATE, allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },

}, {
  tableName: 'tax_transactions',
  underscored: true,
  timestamps: true,
});
