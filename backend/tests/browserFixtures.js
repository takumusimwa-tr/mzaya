const { makeCity, makeUser, makeVendor, makeMenuItem, makeRider } = require('./setup');

async function seedBrowserFixtures() {
  const city = await makeCity();
  let catalog;
  const accounts = {};
  for (const role of ['customer', 'rider', 'vendor', 'admin']) {
    const user = await makeUser(role, { city_id: city.id });
    accounts[role] = { id: user.id, phone: user.phone, password: 'test1234' };
    if (role === 'rider') await makeRider(user, city);
    if (role === 'vendor') {
      const { branch } = await makeVendor(user, city);
      const item = await makeMenuItem(branch);
      catalog = { branchId: branch.id, itemId: item.id, itemName: item.name };
    }
  }
  return { accounts, catalog, city: { id: city.id, slug: city.slug } };
}
module.exports = { seedBrowserFixtures };
