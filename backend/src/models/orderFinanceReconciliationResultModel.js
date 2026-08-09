const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Reconciliation result linking operational orders to finance infrastructure.
module.exports = sequelize.define('OrderFinanceReconciliationResult', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  order_id: { type: DataTypes.UUID, allowNull: false },
  order_type: { type: DataTypes.STRING(40), allowNull: false },
  result_reference: { type: DataTypes.STRING(140), allowNull: false, unique: true },
  status: { type: DataTypes.STRING(30), allowNull: false },
  exception_code: { type: DataTypes.STRING(100), allowNull: true },
  exception_message: { type: DataTypes.STRING(1500), allowNull: true },
  outbox_event_id: { type: DataTypes.UUID, allowNull: true },
  finance_business_event_id: { type: DataTypes.UUID, allowNull: true },
  accounting_event_id: { type: DataTypes.UUID, allowNull: true },
  ledger_transaction_id: { type: DataTypes.UUID, allowNull: true },
  expected_gov_minor: { type: DataTypes.BIGINT, allowNull: true },
  observed_gov_minor: { type: DataTypes.BIGINT, allowNull: true },
  expected_delivery_fee_minor: { type: DataTypes.BIGINT, allowNull: true },
  observed_delivery_fee_minor: { type: DataTypes.BIGINT, allowNull: true },
  expected_platform_fee_minor: { type: DataTypes.BIGINT, allowNull: true },
  observed_platform_fee_minor: { type: DataTypes.BIGINT, allowNull: true },
  currency: { type: DataTypes.STRING(3), allowNull: true },
  evaluated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'order_finance_reconciliation_results',
  underscored: true,
  timestamps: false,
  createdAt: 'created_at',
});
