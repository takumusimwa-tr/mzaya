const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// FinanceIntegrationLog: Batch 08.4.7 finance event-engine persistence model.
module.exports = sequelize.define('FinanceIntegrationLog', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  business_event_id: { type: DataTypes.UUID, allowNull: true },
  stage: { type: DataTypes.STRING(60), allowNull: false },
  status: { type: DataTypes.STRING(30), allowNull: false },
  message: { type: DataTypes.STRING(1000), allowNull: true },
  duration_ms: { type: DataTypes.INTEGER, allowNull: true },
  context: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  occurred_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },

}, {
  tableName: 'finance_integration_logs',
  underscored: true,
  timestamps: true,
});
