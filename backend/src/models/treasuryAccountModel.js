const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TreasuryAccount = sequelize.define('TreasuryAccount', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  code: { type: DataTypes.STRING(60), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(160), allowNull: false },
  account_type: { type: DataTypes.STRING(40), allowNull: false },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active' },
  ledger_account_id: { type: DataTypes.UUID, allowNull: true },
  minimum_balance_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'treasury_accounts',
  underscored: true,
  timestamps: true,
});

module.exports = TreasuryAccount;
