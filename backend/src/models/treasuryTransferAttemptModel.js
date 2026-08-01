const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TreasuryTransferAttempt = sequelize.define('TreasuryTransferAttempt', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  treasury_transfer_id: { type: DataTypes.UUID, allowNull: false },
  attempt_number: { type: DataTypes.INTEGER, allowNull: false },
  provider: { type: DataTypes.STRING(60), allowNull: true },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'processing' },
  provider_reference: { type: DataTypes.STRING(180), allowNull: true },
  request_payload: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  response_payload: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  error_message: { type: DataTypes.STRING(1000), allowNull: true },
  started_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  completed_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'treasury_transfer_attempts',
  underscored: true,
  timestamps: false,
  createdAt: 'created_at',
});

module.exports = TreasuryTransferAttempt;
