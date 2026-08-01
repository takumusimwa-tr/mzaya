const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const BankTransaction = sequelize.define('BankTransaction', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  bank_account_id: { type: DataTypes.UUID, allowNull: false },
  statement_import_id: { type: DataTypes.UUID, allowNull: true },
  provider_reference: { type: DataTypes.STRING(180), allowNull: true },
  transaction_date: { type: DataTypes.DATEONLY, allowNull: false },
  value_date: { type: DataTypes.DATEONLY, allowNull: true },
  direction: { type: DataTypes.ENUM('debit', 'credit'), allowNull: false },
  amount_minor: { type: DataTypes.BIGINT, allowNull: false },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  description: { type: DataTypes.STRING(500), allowNull: true },
  counterparty_name: { type: DataTypes.STRING(180), allowNull: true },
  counterparty_reference: { type: DataTypes.STRING(180), allowNull: true },
  running_balance_minor: { type: DataTypes.BIGINT, allowNull: true },
  reconciliation_status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'unmatched' },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'bank_transactions',
  underscored: true,
  timestamps: true,
});

module.exports = BankTransaction;
