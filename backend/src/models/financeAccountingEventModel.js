const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// FinanceAccountingEvent: Batch 08.4.7 finance event-engine persistence model.
module.exports = sequelize.define('FinanceAccountingEvent', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  business_event_id: { type: DataTypes.UUID, allowNull: false, unique: true },
  posting_rule_id: { type: DataTypes.UUID, allowNull: true },
  posting_template_id: { type: DataTypes.UUID, allowNull: true },
  accounting_reference: { type: DataTypes.STRING(140), allowNull: false, unique: true },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'prepared' },
  debit_total_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  credit_total_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  balanced: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  journal_payload: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  ledger_transaction_id: { type: DataTypes.UUID, allowNull: true },
  prepared_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  posted_at: { type: DataTypes.DATE, allowNull: true },
  reversed_at: { type: DataTypes.DATE, allowNull: true },
  failure_reason: { type: DataTypes.STRING(1500), allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },

}, {
  tableName: 'finance_accounting_events',
  underscored: true,
  timestamps: true,
});
