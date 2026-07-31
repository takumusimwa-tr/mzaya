const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

/**
 * Durable provider webhook envelope.
 * Raw payloads are stored once, then processed asynchronously and idempotently.
 */
const ProviderWebhookEvent = sequelize.define('ProviderWebhookEvent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  provider: {
    type: DataTypes.STRING(40),
    allowNull: false,
  },
  provider_event_id: {
    type: DataTypes.STRING(180),
    allowNull: false,
  },
  event_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  signature_valid: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  status: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'received',
  },
  attempt_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  payload: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  headers: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
  received_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  processing_started_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  processed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  failed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  next_attempt_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  last_error: {
    type: DataTypes.STRING(1000),
    allowNull: true,
  },
}, {
  tableName: 'provider_webhook_events',
  underscored: true,
  timestamps: true,
  indexes: [{
    unique: true,
    fields: ['provider', 'provider_event_id'],
  }],
});

module.exports = ProviderWebhookEvent;
