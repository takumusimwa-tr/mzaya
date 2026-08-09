const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// FinanceDeadLetter: Batch 08.4.8 delivery reliability persistence model.
module.exports = sequelize.define('FinanceDeadLetter', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  outbox_event_id: { type: DataTypes.UUID, allowNull: false },
  dead_letter_reference: { type: DataTypes.STRING(140), allowNull: false, unique: true },
  reason_code: { type: DataTypes.STRING(100), allowNull: false },
  reason: { type: DataTypes.STRING(1500), allowNull: false },
  attempt_count: { type: DataTypes.INTEGER, allowNull: false },
  first_failed_at: { type: DataTypes.DATE, allowNull: true },
  quarantined_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'quarantined' },
  reviewed_by: { type: DataTypes.UUID, allowNull: true },
  reviewed_at: { type: DataTypes.DATE, allowNull: true },
  replay_requested_by: { type: DataTypes.UUID, allowNull: true },
  replay_requested_at: { type: DataTypes.DATE, allowNull: true },
  resolved_at: { type: DataTypes.DATE, allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },

}, {
  tableName: 'finance_dead_letters',
  underscored: true,
  timestamps: true,
});
