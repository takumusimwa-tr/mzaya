const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TreasuryCashPool = sequelize.define('TreasuryCashPool', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  pool_code: { type: DataTypes.STRING(60), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(160), allowNull: false },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  header_bank_account_id: { type: DataTypes.UUID, allowNull: false },
  target_balance_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  minimum_sweep_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  sweep_frequency: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'daily' },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active' },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'treasury_cash_pools',
  underscored: true,
  timestamps: true,
});

module.exports = TreasuryCashPool;
