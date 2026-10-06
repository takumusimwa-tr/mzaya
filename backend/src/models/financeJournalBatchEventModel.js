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
      // Explicit name. The auto-generated one is 65 chars; Postgres truncates
      // identifiers to 63, so on every boot after the first, sync() looked for
      // the full name, didn't find it, tried to create it, and collided with
      // its own truncated copy — crashing boot. This IS the truncated name, so
      // databases that already have the index match it as-is.
      name: 'finance_journal_batch_events_journal_batch_id_accounting_event_',
      unique: true,
      fields: ['journal_batch_id', 'accounting_event_id'],
    },
  ],
});
