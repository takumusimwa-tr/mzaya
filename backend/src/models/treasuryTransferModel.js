const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

/**
 * Treasury transfer persistence contract.
 *
 * The bank/FX fields are the operational execution contract. The legacy finance
 * fields remain as compatibility projections while older finance/reconciliation
 * consumers are migrated. External/manual transfers may not have two internal
 * bank accounts, so operational bank fields are nullable at persistence level;
 * the execution service validates them before crossing the provider boundary.
 */
module.exports = sequelize.define('TreasuryTransfer', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  transfer_reference: { type: DataTypes.STRING(140), allowNull: false, unique: true },
  transfer_type: { type: DataTypes.STRING(40), allowNull: false },

  // Canonical bank/FX execution contract.
  from_bank_account_id: { type: DataTypes.UUID, allowNull: true },
  to_bank_account_id: { type: DataTypes.UUID, allowNull: true },
  source_currency: { type: DataTypes.STRING(3), allowNull: true },
  destination_currency: { type: DataTypes.STRING(3), allowNull: true },
  source_amount_minor: { type: DataTypes.BIGINT, allowNull: true },
  destination_amount_minor: { type: DataTypes.BIGINT, allowNull: true },
  fx_rate_id: { type: DataTypes.UUID, allowNull: true },
  requested_by: { type: DataTypes.UUID, allowNull: true },
  requested_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  failure_reason: { type: DataTypes.STRING(1000), allowNull: true },

  // 08.5.6 finance/event compatibility projection.
  source_account_id: { type: DataTypes.UUID, allowNull: true },
  destination_account_id: { type: DataTypes.UUID, allowNull: true },
  currency: { type: DataTypes.STRING(3), allowNull: true },
  amount_minor: { type: DataTypes.BIGINT, allowNull: true },
  provider: { type: DataTypes.STRING(60), allowNull: true },
  provider_reference: { type: DataTypes.STRING(180), allowNull: true },
  initiated_by: { type: DataTypes.UUID, allowNull: true },
  initiated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  finance_reconciliation_status: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'pending',
  },
  finance_last_reconciled_at: { type: DataTypes.DATE, allowNull: true },

  approved_by: { type: DataTypes.UUID, allowNull: true },
  approved_at: { type: DataTypes.DATE, allowNull: true },
  completed_at: { type: DataTypes.DATE, allowNull: true },
  failed_at: { type: DataTypes.DATE, allowNull: true },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'draft' },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'treasury_transfers',
  underscored: true,
  timestamps: true,
});
