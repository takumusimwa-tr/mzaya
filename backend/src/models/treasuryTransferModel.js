const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TreasuryTransfer = sequelize.define('TreasuryTransfer', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  transfer_reference: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  from_bank_account_id: { type: DataTypes.UUID, allowNull: false },
  to_bank_account_id: { type: DataTypes.UUID, allowNull: false },
  source_currency: { type: DataTypes.STRING(3), allowNull: false },
  destination_currency: { type: DataTypes.STRING(3), allowNull: false },
  source_amount_minor: { type: DataTypes.BIGINT, allowNull: false },
  destination_amount_minor: { type: DataTypes.BIGINT, allowNull: false },
  fx_rate_id: { type: DataTypes.UUID, allowNull: true },
  transfer_type: { type: DataTypes.STRING(40), allowNull: false, defaultValue: 'internal' },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'draft' },
  requested_by: { type: DataTypes.UUID, allowNull: true },
  approved_by: { type: DataTypes.UUID, allowNull: true },
  requested_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  approved_at: { type: DataTypes.DATE, allowNull: true },
  completed_at: { type: DataTypes.DATE, allowNull: true },
  failure_reason: { type: DataTypes.STRING(1000), allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'treasury_transfers',
  underscored: true,
  timestamps: true,
});

module.exports = TreasuryTransfer;
