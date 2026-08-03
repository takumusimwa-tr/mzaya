const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

module.exports = sequelize.define('FinanceAuditPlan', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  plan_reference: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(180), allowNull: false },
  fiscal_year: { type: DataTypes.INTEGER, allowNull: false },
  planning_method: { type: DataTypes.STRING(40), allowNull: false, defaultValue: 'risk_based' },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'draft' },
  owner_id: { type: DataTypes.UUID, allowNull: true },
  approved_by: { type: DataTypes.UUID, allowNull: true },
  approved_at: { type: DataTypes.DATE, allowNull: true },
  risk_universe: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, { tableName: 'finance_audit_plans', underscored: true, timestamps: true });
