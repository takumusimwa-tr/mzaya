const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Advertising placements are NOT checkout discount codes (Promo).
const AdCampaign = sequelize.define('AdCampaign', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  brand_id: { type: DataTypes.UUID, allowNull: false },
  city_id: { type: DataTypes.UUID, allowNull: false },
  category: { type: DataTypes.ENUM('food', 'grocery', 'materials'), allowNull: false },
  title: { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.STRING(240), allowNull: true },
  image_url: { type: DataTypes.STRING(1024), allowNull: true },
  cta: { type: DataTypes.STRING(40), allowNull: false, defaultValue: 'Explore vendor' },
  status: { type: DataTypes.ENUM('draft', 'pending', 'approved', 'rejected', 'paused'), allowNull: false, defaultValue: 'draft' },
  starts_at: { type: DataTypes.DATE, allowNull: false },
  ends_at: { type: DataTypes.DATE, allowNull: false },
}, { tableName: 'ad_campaigns', timestamps: true });
module.exports = AdCampaign;
