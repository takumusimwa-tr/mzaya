const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

module.exports = sequelize.define('FinanceAuditEngagement', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  audit_plan_id: { type: DataTypes.UUID, allowNull: true },
  engagement_reference: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(180), allowNull: false },
  scope_type: { type: DataTypes.STRING(40), allowNull: false },
  scope_value: { type: DataTypes.STRING(180), allowNull: true },
  period_from: { type: DataTypes.DATEONLY, allowNull: false },
  period_to: { type: DataTypes.DATEONLY, allowNull: false },
  risk_rating: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'medium' },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'planned' },
  lead_auditor_id: { type: DataTypes.UUID, allowNull: true },
  started_at: { type: DataTypes.DATE, allowNull: true },
  completed_at: { type: DataTypes.DATE, allowNull: true },
  overall_conclusion: { type: DataTypes.STRING(2000), allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, { tableName: 'finance_audit_engagements', underscored: true, timestamps: true });
