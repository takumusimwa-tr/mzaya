// backend/migrations/backfill_brands.js
// Run once after the brands table + vendors.brand_id exist (i.e. after the app
// boots with the new models). For every vendor without a brand, create a brand
// from the vendor's details and link the vendor to it as its first branch.
//
// Run: node migrations/backfill_brands.js   (from the backend/ folder)

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { sequelize } = require('../src/config/db');
require('../src/models/associations');
const { Vendor, Brand } = require('../src/models/associations');

(async () => {
  try {
    const vendors = await Vendor.findAll({ where: { brand_id: null } });
    console.log(`Found ${vendors.length} vendor(s) without a brand.`);

    for (const v of vendors) {
      // Create a brand mirroring this vendor's storefront identity.
      const brand = await Brand.create({
        owner_id:    v.owner_id,
        name:        v.name,
        category:    v.category,
        description: v.description,
        logo_url:    v.logo_url,
        cover_url:   v.cover_url,
        is_active:   v.is_active,
        rating:      v.rating,
      });

      // Link the vendor as this brand's first branch. Derive a branch label
      // from the vendor name if it contains a location hint, else use city.
      await v.update({
        brand_id:    brand.id,
        branch_name: v.branch_name || deriveBranchName(v.name),
      });

      console.log(`✓ ${v.name} → brand ${brand.id.slice(0, 8)} (branch: ${v.branch_name || deriveBranchName(v.name)})`);
    }

    console.log('Backfill complete.');
  } catch (err) {
    console.error('Backfill failed:', err.message);
  } finally {
    await sequelize.close();
  }
})();

// "Chicken Inn CBD" → "CBD"; "Halsteds" → "Main". Best-effort label.
function deriveBranchName(name) {
  const parts = String(name).trim().split(' ');
  if (parts.length > 1) {
    const last = parts[parts.length - 1];
    // If the last word looks like a location (CBD, a suburb), use it.
    if (/^[A-Z]/.test(last) && last.length <= 12) return last;
  }
  return 'Main';
}
