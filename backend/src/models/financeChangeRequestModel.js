const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

module.exports = sequelize.define('FinanceChangeRequest', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  change_reference: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  record_id: { type: DataTypes.UUID, allowNull: true },
  domain_id: { type: DataTypes.UUID, allowNull: false },
  change_type: { type: DataTypes.STRING(30), allowNull: false },
  requested_payload: { type: DataTypes.JSONB, allowNull: false },
  previous_payload: { type: DataTypes.JSONB, allowNull: true },
  diff_payload: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  impact_assessment: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  reason: { type: DataTypes.STRING(1500), allowNull: false },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'submitted' },
  requested_by: { type: DataTypes.UUID, allowNull: true },
  requested_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  approved_version_id: { type: DataTypes.UUID, allowNull: true },
  implemented_at: { type: DataTypes.DATE, allowNull: true },
  rejected_at: { type: DataTypes.DATE, allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },

}, { tableName: 'finance_change_requests', underscored: true, timestamps: true });
