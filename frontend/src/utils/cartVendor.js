// The store details the cart keeps alongside its items. Shared by the item sheet
// and the menu's quick-add button so the two can never drift apart.
//
// vendorCity must be the city SLUG: it becomes the order's city, and the Mzaya job
// board matches orders on slug. The old name.toLowerCase() worked for "Harare"
// but would have tagged "Victoria Falls" orders as "victoria falls", which no
// Mzaya's board (looking for "victoria-falls") would ever show.
export default function cartVendor(vendor) {
  return {
    vendorId: vendor.id,
    vendorName: vendor.name,
    vendorAddress: vendor.address,
    vendorCity: vendor.city?.slug || (vendor.city?.name ? vendor.city.name.toLowerCase() : null),
    categoryType: vendor.category,
  }
}
