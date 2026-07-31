const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ComplianceAuditLog = sequelize.define('ComplianceAuditLog', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  actor_id: { type: DataTypes.UUID, allowNull: true },
  action: { type: DataTypes.STRING(80), allowNull: false },
  resource_type: { type: DataTypes.STRING(60), allowNull: false },
  resource_id: { type: DataTypes.UUID, allowNull: true },
  previous_value: { type: DataTypes.JSONB, allowNull: true },
  new_value: { type: DataTypes.JSONB, allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  occurred_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  tableName: 'compliance_audit_log',
  underscored: true,
  timestamps: false,
  createdAt: 'created_at',
});

module.exports = ComplianceAuditLog;
