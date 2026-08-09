const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// FinanceOutboxEvent: Batch 08.4.8 delivery reliability persistence model.
module.exports = sequelize.define('FinanceOutboxEvent', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  aggregate_type: { type: DataTypes.STRING(80), allowNull: false },
  aggregate_id: { type: DataTypes.UUID, allowNull: true },
  event_type: { type: DataTypes.STRING(120), allowNull: false },
  event_key: { type: DataTypes.STRING(160), allowNull: false, unique: true },
  source_system: { type: DataTypes.STRING(80), allowNull: false },
  payload: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  payload_hash: { type: DataTypes.STRING(128), allowNull: false },
  idempotency_key: { type: DataTypes.STRING(180), allowNull: false, unique: true },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'pending' },
  available_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  published_at: { type: DataTypes.DATE, allowNull: true },
  attempt_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  last_error: { type: DataTypes.STRING(1500), allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },

}, {
  tableName: 'finance_outbox_events',
  underscored: true,
  timestamps: true,
});
