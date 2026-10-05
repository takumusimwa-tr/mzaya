const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');


module.exports = sequelize.define('FinanceCutoverDecision', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  decision_reference: { type: DataTypes.STRING(140), allowNull: false, unique: true },
  control_id: { type: DataTypes.UUID, allowNull: false },
  decision: { type: DataTypes.STRING(30), allowNull: false },
  reason: { type: DataTypes.STRING(1500), allowNull: false },
  evidence_snapshot: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  requested_by: { type: DataTypes.UUID, allowNull: true },
  requested_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  approved_by: { type: DataTypes.UUID, allowNull: true },
  approved_at: { type: DataTypes.DATE, allowNull: true },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'pending_approval' },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, { tableName: 'finance_cutover_decisions', underscored: true, timestamps: false });
