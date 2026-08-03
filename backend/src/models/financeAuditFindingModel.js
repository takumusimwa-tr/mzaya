const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

module.exports = sequelize.define('FinanceAuditFinding', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  engagement_id: { type: DataTypes.UUID, allowNull: false },
  assessment_id: { type: DataTypes.UUID, allowNull: true },
  finding_reference: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  title: { type: DataTypes.STRING(220), allowNull: false },
  description: { type: DataTypes.STRING(2000), allowNull: false },
  root_cause: { type: DataTypes.STRING(1500), allowNull: true },
  impact: { type: DataTypes.STRING(1500), allowNull: true },
  severity: { type: DataTypes.STRING(20), allowNull: false },
  risk_rating: { type: DataTypes.STRING(20), allowNull: false },
  recurrence_key: { type: DataTypes.STRING(120), allowNull: true },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'open' },
  management_response: { type: DataTypes.STRING(2000), allowNull: true },
  owner_id: { type: DataTypes.UUID, allowNull: true },
  target_date: { type: DataTypes.DATEONLY, allowNull: true },
  closed_by: { type: DataTypes.UUID, allowNull: true },
  closed_at: { type: DataTypes.DATE, allowNull: true },
  created_by: { type: DataTypes.UUID, allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, { tableName: 'finance_audit_findings', underscored: true, timestamps: true });
