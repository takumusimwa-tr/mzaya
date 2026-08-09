const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

module.exports = sequelize.define('TreasuryTransfer', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  transfer_reference: { type: DataTypes.STRING(140), allowNull: false, unique: true },
  transfer_type: { type: DataTypes.STRING(40), allowNull: false },
  source_account_id: { type: DataTypes.UUID, allowNull: true },
  destination_account_id: { type: DataTypes.UUID, allowNull: true },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  amount_minor: { type: DataTypes.BIGINT, allowNull: false },
  provider: { type: DataTypes.STRING(60), allowNull: true },
  provider_reference: { type: DataTypes.STRING(180), allowNull: true },
  initiated_by: { type: DataTypes.UUID, allowNull: true },
  initiated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  approved_by: { type: DataTypes.UUID, allowNull: true },
  approved_at: { type: DataTypes.DATE, allowNull: true },
  completed_at: { type: DataTypes.DATE, allowNull: true },
  failed_at: { type: DataTypes.DATE, allowNull: true },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'draft' },
  finance_reconciliation_status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'pending' },
  finance_last_reconciled_at: { type: DataTypes.DATE, allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },

}, {
  tableName: 'treasury_transfers',
  underscored: true,
  timestamps: true,
});
