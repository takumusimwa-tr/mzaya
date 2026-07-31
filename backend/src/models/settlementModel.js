const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Settlement = sequelize.define('Settlement', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  batch_id: { type: DataTypes.UUID, allowNull: false },
  profile_id: { type: DataTypes.UUID, allowNull: false },
  owner_type: { type: DataTypes.STRING(20), allowNull: false },
  owner_id: { type: DataTypes.UUID, allowNull: false },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  gross_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  adjustments_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  fees_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  net_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  payable_account_id: { type: DataTypes.UUID, allowNull: false },
  payout_account_id: { type: DataTypes.UUID, allowNull: false },
  payout_reference: { type: DataTypes.STRING(180), allowNull: true },
  provider: { type: DataTypes.STRING(40), allowNull: true },
  provider_payload: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'pending' },
  failure_reason: { type: DataTypes.STRING(500), allowNull: true },
  submitted_at: { type: DataTypes.DATE, allowNull: true },
  paid_at: { type: DataTypes.DATE, allowNull: true },
  failed_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'settlements',
  underscored: true,
  timestamps: true,
});

module.exports = Settlement;
