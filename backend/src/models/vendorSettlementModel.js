const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// VendorSettlement: governed vendor liability and payout record.
module.exports = sequelize.define('VendorSettlement', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  vendor_id: { type: DataTypes.UUID, allowNull: false },
  settlement_reference: { type: DataTypes.STRING(140), allowNull: false, unique: true },
  period_from: { type: DataTypes.DATEONLY, allowNull: true },
  period_to: { type: DataTypes.DATEONLY, allowNull: true },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  gross_sales_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  refunds_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  discounts_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  commission_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  platform_fee_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  tax_withheld_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  adjustments_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  amount_due_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  amount_paid_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'draft' },
  provider: { type: DataTypes.STRING(60), allowNull: true },
  provider_reference: { type: DataTypes.STRING(180), allowNull: true },
  due_at: { type: DataTypes.DATE, allowNull: true },
  approved_by: { type: DataTypes.UUID, allowNull: true },
  approved_at: { type: DataTypes.DATE, allowNull: true },
  paid_by: { type: DataTypes.UUID, allowNull: true },
  paid_at: { type: DataTypes.DATE, allowNull: true },
  finance_reconciliation_status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'pending' },
  finance_last_reconciled_at: { type: DataTypes.DATE, allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'vendor_settlements',
  underscored: true,
  timestamps: true,
});
