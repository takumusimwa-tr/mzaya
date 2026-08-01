const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const FinancialControlPolicy = sequelize.define('FinancialControlPolicy', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  policy_key: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(160), allowNull: false },
  resource_type: { type: DataTypes.STRING(60), allowNull: false },
  action: { type: DataTypes.STRING(80), allowNull: false },
  currency: DataTypes.STRING(3),
  threshold_minor: DataTypes.BIGINT,
  required_approvals: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  require_distinct_creator: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  approver_roles: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active' },
}, { tableName: 'financial_control_policies', underscored: true, timestamps: true });

const FinancialApprovalRequest = sequelize.define('FinancialApprovalRequest', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  policy_id: { type: DataTypes.UUID, allowNull: false },
  resource_type: { type: DataTypes.STRING(60), allowNull: false },
  resource_id: DataTypes.UUID,
  action: { type: DataTypes.STRING(80), allowNull: false },
  requested_by: { type: DataTypes.UUID, allowNull: false },
  amount_minor: DataTypes.BIGINT,
  currency: DataTypes.STRING(3),
  request_payload: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'pending' },
  required_approvals: { type: DataTypes.INTEGER, allowNull: false },
  approval_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  rejection_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  expires_at: DataTypes.DATE,
  approved_at: DataTypes.DATE,
  rejected_at: DataTypes.DATE,
  executed_at: DataTypes.DATE,
  execution_result: DataTypes.JSONB,
}, { tableName: 'financial_approval_requests', underscored: true, timestamps: true });

const FinancialApprovalDecision = sequelize.define('FinancialApprovalDecision', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  approval_request_id: { type: DataTypes.UUID, allowNull: false },
  decided_by: { type: DataTypes.UUID, allowNull: false },
  decision: { type: DataTypes.ENUM('approve', 'reject'), allowNull: false },
  notes: DataTypes.STRING(1000),
  decided_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, { tableName: 'financial_approval_decisions', underscored: true, timestamps: false, createdAt: 'created_at' });

const FinancialControlException = sequelize.define('FinancialControlException', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  approval_request_id: DataTypes.UUID,
  exception_type: { type: DataTypes.STRING(60), allowNull: false },
  severity: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'medium' },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'open' },
  summary: { type: DataTypes.STRING(300), allowNull: false },
  details: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  detected_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  resolved_by: DataTypes.UUID,
  resolved_at: DataTypes.DATE,
  resolution_notes: DataTypes.STRING(1500),
}, { tableName: 'financial_control_exceptions', underscored: true, timestamps: true });

module.exports = {
  FinancialControlPolicy,
  FinancialApprovalRequest,
  FinancialApprovalDecision,
  FinancialControlException,
};
