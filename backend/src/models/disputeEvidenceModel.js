const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const DisputeEvidence = sequelize.define('DisputeEvidence', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  dispute_id: { type: DataTypes.UUID, allowNull: false },
  submitted_by: { type: DataTypes.UUID, allowNull: false },
  evidence_type: { type: DataTypes.STRING(40), allowNull: false },
  attachment_id: { type: DataTypes.UUID, allowNull: true },
  notes: { type: DataTypes.STRING(1000), allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'dispute_evidence',
  underscored: true,
  timestamps: false,
  createdAt: 'created_at',
});

module.exports = DisputeEvidence;
