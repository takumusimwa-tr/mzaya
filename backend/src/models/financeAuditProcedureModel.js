const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

module.exports = sequelize.define('FinanceAuditProcedure', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  engagement_id: { type: DataTypes.UUID, allowNull: false },
  procedure_key: { type: DataTypes.STRING(100), allowNull: false },
  name: { type: DataTypes.STRING(180), allowNull: false },
  control_area: { type: DataTypes.STRING(60), allowNull: false },
  procedure_type: { type: DataTypes.STRING(30), allowNull: false },
  description: { type: DataTypes.STRING(1500), allowNull: true },
  expected_result: { type: DataTypes.STRING(1000), allowNull: true },
  sequence: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 100 },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'pending' },
  assigned_to: { type: DataTypes.UUID, allowNull: true },
  completed_by: { type: DataTypes.UUID, allowNull: true },
  completed_at: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'finance_audit_procedures', underscored: true, timestamps: true });
