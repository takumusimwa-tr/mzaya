const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// FinanceBusinessEvent: Batch 08.4.7 finance event-engine persistence model.
module.exports = sequelize.define('FinanceBusinessEvent', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  event_key: { type: DataTypes.STRING(140), allowNull: false, unique: true },
  event_type: { type: DataTypes.STRING(120), allowNull: false },
  source_system: { type: DataTypes.STRING(80), allowNull: false },
  source_entity_type: { type: DataTypes.STRING(80), allowNull: true },
  source_entity_id: { type: DataTypes.UUID, allowNull: true },
  source_reference: { type: DataTypes.STRING(180), allowNull: true },
  occurred_at: { type: DataTypes.DATE, allowNull: false },
  received_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  currency: { type: DataTypes.STRING(3), allowNull: true },
  amount_minor: { type: DataTypes.BIGINT, allowNull: true },
  payload: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  payload_hash: { type: DataTypes.STRING(128), allowNull: false },
  idempotency_key: { type: DataTypes.STRING(180), allowNull: false, unique: true },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'received' },
  processing_attempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  processed_at: { type: DataTypes.DATE, allowNull: true },
  failed_at: { type: DataTypes.DATE, allowNull: true },
  failure_reason: { type: DataTypes.STRING(1500), allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },

}, {
  tableName: 'finance_business_events',
  underscored: true,
  timestamps: true,
});
