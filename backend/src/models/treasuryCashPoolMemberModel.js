const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TreasuryCashPoolMember = sequelize.define('TreasuryCashPoolMember', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  cash_pool_id: { type: DataTypes.UUID, allowNull: false },
  bank_account_id: { type: DataTypes.UUID, allowNull: false },
  target_balance_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  sweep_direction: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'both' },
  priority: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 100 },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active' },
}, {
  tableName: 'treasury_cash_pool_members',
  underscored: true,
  timestamps: true,
});

module.exports = TreasuryCashPoolMember;
