const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// A customer's favourited BRAND (not a specific branch). The favourites feature
// predates the brand→branch restructure; the controllers query a `favorites`
// table directly via raw SQL, but there was never a Sequelize model for it — so on
// a fresh database (staging), sync() never created the table and every
// /api/favorites call 500'd with "relation favorites does not exist".
//
// This model defines that table so sync({ alter: true }) builds it. Columns match
// exactly what favorite.controller.js reads/writes: customer_id, brand_id, and the
// default camelCase timestamps (the raw SQL references f."createdAt").
const Favorite = sequelize.define('Favorite', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  customer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    // FK to users(id) — wired in associations.js
  },

  brand_id: {
    type: DataTypes.UUID,
    allowNull: false,
    // FK to brands(id) — wired in associations.js
  },
}, {
  tableName: 'favorites',
  timestamps: true,   // createdAt / updatedAt — the controllers order by "createdAt"
  indexes: [
    {
      // One row per (customer, brand). toggleFavorite relies on this to flip a
      // heart on/off cleanly.
      unique: true,
      fields: ['customer_id', 'brand_id'],
    },
  ],
});

module.exports = Favorite;
