const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

/**
 * Immutable business event represented by balanced ledger entries.
 * Never edit a posted transaction to correct money. Post a reversal instead.
 */
const LedgerTransaction = sequelize.define('LedgerTransaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  reference: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  transaction_type: {
    type: DataTypes.STRING(40),
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'posted',
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  payment_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
  occurred_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  reversed_by_transaction_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  tableName: 'ledger_transactions',
  underscored: true,
  timestamps: true,
});

module.exports = LedgerTransaction;
