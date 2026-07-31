const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const DeliveryProof = sequelize.define('DeliveryProof', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },
  rider_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  proof_type: {
    type: DataTypes.ENUM('otp', 'photo', 'signature', 'recipient_confirmation'),
    allowNull: false,
  },
  recipient_name: {
    type: DataTypes.STRING(120),
    allowNull: true,
  },
  recipient_phone: {
    type: DataTypes.STRING(40),
    allowNull: true,
  },
  otp_verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  photo_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  signature_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  notes: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true,
  },
  captured_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'delivery_proofs',
  underscored: true,
  timestamps: true,
});

module.exports = DeliveryProof;
