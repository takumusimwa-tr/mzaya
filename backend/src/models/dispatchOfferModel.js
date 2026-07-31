const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const DispatchOffer = sequelize.define('DispatchOffer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  rider_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(
      'offered',
      'accepted',
      'declined',
      'expired',
      'cancelled'
    ),
    allowNull: false,
    defaultValue: 'offered',
  },
  score: {
    type: DataTypes.DECIMAL(12, 6),
    allowNull: false,
  },
  distance_km: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: true,
  },
  pickup_eta_minutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  offered_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  responded_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  decline_reason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'dispatch_offers',
  underscored: true,
  timestamps: true,
});

module.exports = DispatchOffer;
