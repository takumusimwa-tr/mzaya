const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Durable de-duplication for provider callbacks/polls.
module.exports = sequelize.define('ProviderCallbackReceipt', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  provider: {
    type: DataTypes.STRING(60),
    allowNull: false,
  },
  callback_key: {
    type: DataTypes.STRING(220),
    allowNull: false,
    unique: true,
  },
  payment_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  outcome: {
    type: DataTypes.STRING(30),
    allowNull: true,
  },
  raw_status: {
    type: DataTypes.STRING(120),
    allowNull: true,
  },
  received_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  processed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
}, {
  tableName: 'provider_callback_receipts',
  underscored: true,
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['callback_key'],
    },
    {
      fields: ['provider', 'payment_id'],
    },
  ],
});
