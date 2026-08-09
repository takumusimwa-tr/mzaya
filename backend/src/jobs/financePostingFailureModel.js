const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// FinancePostingFailure: Batch 08.4.7 finance event-engine persistence model.
module.exports = sequelize.define('FinancePostingFailure', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  business_event_id: { type: DataTypes.UUID, allowNull: true },
  accounting_event_id: { type: DataTypes.UUID, allowNull: true },
  failure_code: { type: DataTypes.STRING(100), allowNull: false },
  failure_stage: { type: DataTypes.STRING(60), allowNull: false },
  error_message: { type: DataTypes.STRING(1500), allowNull: false },
  error_context: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'open' },
  occurrence_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  first_occurred_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  last_occurred_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  resolved_at: { type: DataTypes.DATE, allowNull: true },
  resolved_by: { type: DataTypes.UUID, allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },

}, {
  tableName: 'finance_posting_failures',
  underscored: true,
  timestamps: true,
});
