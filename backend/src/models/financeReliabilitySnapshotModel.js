const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// FinanceReliabilitySnapshot: Batch 08.4.8 delivery reliability persistence model.
module.exports = sequelize.define('FinanceReliabilitySnapshot', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  snapshot_at: { type: DataTypes.DATE, allowNull: false },
  source_system: { type: DataTypes.STRING(80), allowNull: true },
  pending_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  published_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  failed_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  dead_letter_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  oldest_pending_age_seconds: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  avg_delivery_latency_ms: { type: DataTypes.DECIMAL(18, 4), allowNull: true },
  p95_delivery_latency_ms: { type: DataTypes.DECIMAL(18, 4), allowNull: true },
  duplicate_delivery_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  stale_lease_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  consumer_lag_seconds: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  health_status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'healthy' },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },

}, {
  tableName: 'finance_reliability_snapshots',
  underscored: true,
  timestamps: true,
});
