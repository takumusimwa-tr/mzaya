const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TreasuryReconciliation = sequelize.define('TreasuryReconciliation', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  bank_transaction_id: { type: DataTypes.UUID, allowNull: false, unique: true },
  ledger_transaction_id: { type: DataTypes.UUID, allowNull: true },
  matched_by: { type: DataTypes.UUID, allowNull: true },
  match_type: { type: DataTypes.STRING(30), allowNull: false },
  amount_difference_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'matched' },
  notes: { type: DataTypes.STRING(1000), allowNull: true },
  matched_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  tableName: 'treasury_reconciliations',
  underscored: true,
  timestamps: false,
  createdAt: 'created_at',
});

module.exports = TreasuryReconciliation;
