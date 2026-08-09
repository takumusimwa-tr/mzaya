const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// FinanceConsumerOffset: Batch 08.4.8 delivery reliability persistence model.
module.exports = sequelize.define('FinanceConsumerOffset', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  consumer_key: { type: DataTypes.STRING(120), allowNull: false },
  partition_key: { type: DataTypes.STRING(120), allowNull: false, defaultValue: 'default' },
  last_event_id: { type: DataTypes.UUID, allowNull: true },
  last_event_created_at: { type: DataTypes.DATE, allowNull: true },
  last_processed_at: { type: DataTypes.DATE, allowNull: true },
  lag_seconds: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active' },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },

}, {
  tableName: 'finance_consumer_offsets',
  underscored: true,
  timestamps: true,
});
