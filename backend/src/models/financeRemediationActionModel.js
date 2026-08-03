const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

module.exports = sequelize.define('FinanceRemediationAction', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  finding_id: { type: DataTypes.UUID, allowNull: false },
  action_reference: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  action_title: { type: DataTypes.STRING(220), allowNull: false },
  action_description: { type: DataTypes.STRING(2000), allowNull: true },
  owner_id: { type: DataTypes.UUID, allowNull: true },
  due_date: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'open' },
  completion_evidence: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  completed_by: { type: DataTypes.UUID, allowNull: true },
  completed_at: { type: DataTypes.DATE, allowNull: true },
  verified_by: { type: DataTypes.UUID, allowNull: true },
  verified_at: { type: DataTypes.DATE, allowNull: true },
  verification_notes: { type: DataTypes.STRING(1500), allowNull: true },
}, { tableName: 'finance_remediation_actions', underscored: true, timestamps: true });
