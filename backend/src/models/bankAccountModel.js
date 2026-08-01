const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const BankAccount = sequelize.define('BankAccount', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  treasury_account_id: { type: DataTypes.UUID, allowNull: false },
  bank_name: { type: DataTypes.STRING(160), allowNull: false },
  account_name: { type: DataTypes.STRING(180), allowNull: false },
  account_last4: { type: DataTypes.STRING(4), allowNull: false },
  account_token: { type: DataTypes.STRING(255), allowNull: true },
  branch_code: { type: DataTypes.STRING(60), allowNull: true },
  swift_code: { type: DataTypes.STRING(20), allowNull: true },
  country_code: { type: DataTypes.STRING(2), allowNull: true },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active' },
  current_balance_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  available_balance_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  last_synced_at: { type: DataTypes.DATE, allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'bank_accounts',
  underscored: true,
  timestamps: true,
});

module.exports = BankAccount;
