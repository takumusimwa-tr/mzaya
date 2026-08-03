const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

module.exports = sequelize.define('FinanceAuditEvidence', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  engagement_id: { type: DataTypes.UUID, allowNull: true },
  procedure_id: { type: DataTypes.UUID, allowNull: true },
  assessment_id: { type: DataTypes.UUID, allowNull: true },
  evidence_reference: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  evidence_type: { type: DataTypes.STRING(40), allowNull: false },
  title: { type: DataTypes.STRING(220), allowNull: false },
  source_type: { type: DataTypes.STRING(60), allowNull: true },
  source_id: { type: DataTypes.UUID, allowNull: true },
  storage_key: { type: DataTypes.TEXT, allowNull: true },
  content_hash: { type: DataTypes.STRING(128), allowNull: true },
  confidentiality: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'internal' },
  retention_until: { type: DataTypes.DATEONLY, allowNull: true },
  collected_by: { type: DataTypes.UUID, allowNull: true },
  collected_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, { tableName: 'finance_audit_evidence', underscored: true, timestamps: false, createdAt: 'created_at' });
