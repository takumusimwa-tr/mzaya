const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Every event the payment provider sends us, recorded once.
//
// Paynow (like every gateway) retries webhooks. Without a record of what we've
// already seen, a retried "paid" webhook repeats its side effects, and a delayed
// "failed" webhook arriving AFTER a "paid" one can drag a settled order
// backwards. Both are real, and both cost money.
//
// The unique constraint on (provider_reference, status_hash) means the same event
// can arrive ten times and only be applied once.
const PaymentEvent = sequelize.define('PaymentEvent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  order_id:   { type: DataTypes.UUID,   allowNull: true },
  attempt_id: { type: DataTypes.UUID,   allowNull: true },

  provider:           { type: DataTypes.STRING, allowNull: false, defaultValue: 'paynow' },
  provider_reference: { type: DataTypes.STRING, allowNull: false },

  // Raw status string as the provider phrased it, plus our normalised reading.
  raw_status:        { type: DataTypes.STRING, allowNull: true },
  normalized_status: { type: DataTypes.STRING, allowNull: true },

  // Hash of the payload — the dedup key alongside the reference.
  payload_hash: { type: DataTypes.STRING, allowNull: false },

  // Did we act on it, or was it a duplicate / out-of-order no-op?
  applied:      { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  ignored_why:  { type: DataTypes.STRING,  allowNull: true },
}, {
  tableName: 'payment_events',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['provider_reference', 'payload_hash'] },
    { fields: ['order_id'] },
  ],
});

module.exports = PaymentEvent;
