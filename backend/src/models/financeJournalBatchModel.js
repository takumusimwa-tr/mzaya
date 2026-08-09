const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// FinanceJournalBatch: Batch 08.4.7 finance event-engine persistence model.
module.exports = sequelize.define('FinanceJournalBatch', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  batch_reference: { type: DataTypes.STRING(140), allowNull: false, unique: true },
  batch_type: { type: DataTypes.STRING(40), allowNull: false, defaultValue: 'automatic' },
  period_key: { type: DataTypes.STRING(30), allowNull: false },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'open' },
  event_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  debit_total_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  credit_total_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  balanced: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  created_by: { type: DataTypes.UUID, allowNull: true },
  posted_by: { type: DataTypes.UUID, allowNull: true },
  posted_at: { type: DataTypes.DATE, allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },

}, {
  tableName: 'finance_journal_batches',
  underscored: true,
  timestamps: true,
});
