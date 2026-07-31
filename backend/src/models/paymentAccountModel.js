const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

/**
 * Represents a financial bucket in Mzaya's double-entry ledger.
 * Examples: customer funds clearing, platform fees payable,
 * vendor payable, Mzaya earnings payable and provider clearing.
 */
const PaymentAccount = sequelize.define('PaymentAccount', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  owner_type: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
  owner_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  account_type: {
    type: DataTypes.STRING(40),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'active',
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
}, {
  tableName: 'payment_accounts',
  underscored: true,
  timestamps: true,
});

module.exports = PaymentAccount;
