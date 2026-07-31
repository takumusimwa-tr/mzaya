const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const DisputeTimeline = sequelize.define('DisputeTimeline', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  dispute_id: { type: DataTypes.UUID, allowNull: false },
  actor_id: { type: DataTypes.UUID, allowNull: true },
  event_type: { type: DataTypes.STRING(60), allowNull: false },
  body: { type: DataTypes.STRING(1200), allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'dispute_timeline',
  underscored: true,
  timestamps: false,
  createdAt: 'created_at',
});

module.exports = DisputeTimeline;
