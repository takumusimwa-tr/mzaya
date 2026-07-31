const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

/**
 * Persists payment mutation results so provider retries and user double-clicks
 * cannot create duplicate charges, refunds or settlements.
 */
const PaymentIdempotencyKey = sequelize.define('PaymentIdempotencyKey', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  idempotency_key: {
    type: DataTypes.STRING(180),
    allowNull: false,
    unique: true,
  },
  operation: {
    type: DataTypes.STRING(80),
    allowNull: false,
  },
  request_hash: {
    type: DataTypes.STRING(128),
    allowNull: false,
  },
  response_status: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  response_body: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  resource_type: {
    type: DataTypes.STRING(60),
    allowNull: true,
  },
  resource_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  locked_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'payment_idempotency_keys',
  underscored: true,
  timestamps: true,
});

module.exports = PaymentIdempotencyKey;
