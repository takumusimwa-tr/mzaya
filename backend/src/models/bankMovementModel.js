const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

module.exports = sequelize.define('BankMovement', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  bank_movement_reference: { type: DataTypes.STRING(140), allowNull: false, unique: true },
  treasury_transfer_id: { type: DataTypes.UUID, allowNull: true },
  bank_account_id: { type: DataTypes.UUID, allowNull: false },
  direction: { type: DataTypes.STRING(10), allowNull: false },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  amount_minor: { type: DataTypes.BIGINT, allowNull: false },
  booking_date: { type: DataTypes.DATEONLY, allowNull: true },
  value_date: { type: DataTypes.DATEONLY, allowNull: true },
  bank_reference: { type: DataTypes.STRING(180), allowNull: true },
  counterparty: { type: DataTypes.STRING(220), allowNull: true },
  description: { type: DataTypes.STRING(500), allowNull: true },
  source: { type: DataTypes.STRING(40), allowNull: false, defaultValue: 'manual' },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'unmatched' },
  matched_at: { type: DataTypes.DATE, allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },

}, {
  tableName: 'bank_movements',
  underscored: true,
  timestamps: true,
});
