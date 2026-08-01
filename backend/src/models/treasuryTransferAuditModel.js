const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TreasuryTransferAudit = sequelize.define('TreasuryTransferAudit', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  treasury_transfer_id: { type: DataTypes.UUID, allowNull: false },
  actor_id: { type: DataTypes.UUID, allowNull: true },
  action: { type: DataTypes.STRING(60), allowNull: false },
  previous_value: { type: DataTypes.JSONB, allowNull: true },
  new_value: { type: DataTypes.JSONB, allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'treasury_transfer_audit',
  underscored: true,
  timestamps: false,
  createdAt: 'created_at',
});

module.exports = TreasuryTransferAudit;
