const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Join model between a finance journal batch and prepared accounting events.
module.exports = sequelize.define('FinanceJournalBatchEvent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  journal_batch_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  accounting_event_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: 'finance_journal_batch_events',
  underscored: true,
  timestamps: false,
  createdAt: 'created_at',
  indexes: [
    {
      unique: true,
      fields: ['journal_batch_id', 'accounting_event_id'],
    },
  ],
});
