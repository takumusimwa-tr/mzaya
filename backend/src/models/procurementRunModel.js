const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// ProcurementRun: authoritative commercial/operational procurement record.
module.exports = sequelize.define('ProcurementRun', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  procurement_reference: { type: DataTypes.STRING(140), allowNull: false, unique: true },
  customer_id: { type: DataTypes.UUID, allowNull: true },
  vendor_id: { type: DataTypes.UUID, allowNull: true },
  order_id: { type: DataTypes.UUID, allowNull: true },
  order_type: { type: DataTypes.STRING(40), allowNull: true },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  merchandise_cost_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  procurement_fee_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  delivery_fee_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  tax_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  discount_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  reimbursement_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  amount_authorized_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  amount_spent_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  amount_refundable_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'draft' },
  approved_by: { type: DataTypes.UUID, allowNull: true },
  approved_at: { type: DataTypes.DATE, allowNull: true },
  completed_by: { type: DataTypes.UUID, allowNull: true },
  completed_at: { type: DataTypes.DATE, allowNull: true },
  finance_reconciliation_status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'pending' },
  finance_last_reconciled_at: { type: DataTypes.DATE, allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'procurement_runs',
  underscored: true,
  timestamps: true,
});
