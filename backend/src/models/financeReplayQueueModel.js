const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// FinanceReplayQueue: Batch 08.4.7 finance event-engine persistence model.
module.exports = sequelize.define('FinanceReplayQueue', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  business_event_id: { type: DataTypes.UUID, allowNull: false },
  replay_reason: { type: DataTypes.STRING(500), allowNull: false },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'queued' },
  attempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  next_attempt_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  requested_by: { type: DataTypes.UUID, allowNull: true },
  requested_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  last_attempt_at: { type: DataTypes.DATE, allowNull: true },
  completed_at: { type: DataTypes.DATE, allowNull: true },
  failure_reason: { type: DataTypes.STRING(1500), allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },

}, {
  tableName: 'finance_replay_queue',
  underscored: true,
  timestamps: true,
});
