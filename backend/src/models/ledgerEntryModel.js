const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

/**
 * One debit or credit line. Every posted transaction must have equal totals
 * for debit and credit entries in the same currency.
 */
const LedgerEntry = sequelize.define('LedgerEntry', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  transaction_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  account_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  direction: {
    type: DataTypes.ENUM('debit', 'credit'),
    allowNull: false,
  },
  amount_minor: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  balance_after_minor: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
}, {
  tableName: 'ledger_entries',
  underscored: true,
  timestamps: false,
  createdAt: 'created_at',
});

module.exports = LedgerEntry;
