const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// MzayaPayout: payable and payout lifecycle for delivery partners called Mzaya.
module.exports = sequelize.define('MzayaPayout', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  mzaya_id: { type: DataTypes.UUID, allowNull: false },
  payout_reference: { type: DataTypes.STRING(140), allowNull: false, unique: true },
  period_from: { type: DataTypes.DATEONLY, allowNull: true },
  period_to: { type: DataTypes.DATEONLY, allowNull: true },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  delivery_earnings_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  tips_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  incentives_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  reimbursements_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  penalties_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  withholding_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  adjustments_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  amount_due_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  amount_paid_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'draft' },
  payout_method: { type: DataTypes.STRING(40), allowNull: true },
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
  tableName: 'mzaya_payouts',
  underscored: true,
  timestamps: true,
});
