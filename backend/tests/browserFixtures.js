const { makeCity, makeUser, makeVendor, makeMenuItem, makeRider } = require('./setup');

async function seedWorld() {
  const city = await makeCity();
  let catalog;
  const accounts = {};
  for (const role of ['customer', 'rider', 'vendor', 'admin']) {
    const user = await makeUser(role, { city_id: city.id });
    accounts[role] = { id: user.id, phone: user.phone, password: 'test1234' };
    if (role === 'rider') await makeRider(user, city);
    if (role === 'vendor') {
      const { branch, brand } = await makeVendor(user, city);
      const item = await makeMenuItem(branch);
      catalog = { brandName: brand.name, branchId: branch.id, itemId: item.id, itemName: item.name };
    }
  }
  return { accounts, catalog, city: { id: city.id, slug: city.slug, name: city.name } };
}
async function seedBrowserFixtures() {
  const delivery = await seedWorld();
  const checkout = await seedWorld();
  return { ...delivery, checkout };
}
module.exports = { seedBrowserFixtures };
