const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// FinanceDeliveryAttempt: Batch 08.4.8 delivery reliability persistence model.
module.exports = sequelize.define('FinanceDeliveryAttempt', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  outbox_event_id: { type: DataTypes.UUID, allowNull: false },
  attempt_number: { type: DataTypes.INTEGER, allowNull: false },
  worker_id: { type: DataTypes.STRING(120), allowNull: true },
  destination: { type: DataTypes.STRING(120), allowNull: false, defaultValue: 'finance_event_engine' },
  status: { type: DataTypes.STRING(30), allowNull: false },
  started_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  completed_at: { type: DataTypes.DATE, allowNull: true },
  duration_ms: { type: DataTypes.INTEGER, allowNull: true },
  response_reference: { type: DataTypes.STRING(180), allowNull: true },
  error_code: { type: DataTypes.STRING(100), allowNull: true },
  error_message: { type: DataTypes.STRING(1500), allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },

}, {
  tableName: 'finance_delivery_attempts',
  underscored: true,
  timestamps: true,
});
