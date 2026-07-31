const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

/**
 * Controls how and when a vendor or Mzaya receives payouts.
 * Payout destinations must contain tokens or references, never raw secrets.
 */
const SettlementProfile = sequelize.define('SettlementProfile', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  owner_type: { type: DataTypes.STRING(20), allowNull: false },
  owner_id: { type: DataTypes.UUID, allowNull: false },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  payout_method: { type: DataTypes.STRING(30), allowNull: false },
  payout_destination: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  minimum_payout_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  schedule: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'weekly' },
  hold_days: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active' },
  last_settled_at: { type: DataTypes.DATE, allowNull: true },
  next_settlement_at: { type: DataTypes.DATE, allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'settlement_profiles',
  underscored: true,
  timestamps: true,
});

module.exports = SettlementProfile;
