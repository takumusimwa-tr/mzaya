const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const OrderTimeline = sequelize.define('OrderTimeline', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  order_id: { type: DataTypes.UUID, allowNull: false },
  from_status: { type: DataTypes.STRING(50), allowNull: true },
  to_status: { type: DataTypes.STRING(50), allowNull: false },
  actor_id: { type: DataTypes.UUID, allowNull: true },
  actor_role: { type: DataTypes.STRING(30), allowNull: true },
  note: { type: DataTypes.STRING(500), allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'order_timelines',
  timestamps: true,
  updatedAt: false,
});

module.exports = OrderTimeline;
