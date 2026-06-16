import { create } from 'zustand'

const useCartStore = create((set, get) => ({
  items:         [],
  vendor:        null,
  vendorName:    null,
  vendorAddress: null,
  categoryType:  null,
  city:          null,

  // Add item — enforces single-vendor rule
  addItem: (item, vendor, vendorName, categoryType, city, vendorAddress) => {
    const { vendor: currentVendor, items } = get()

    // Switching vendors clears cart
    if (currentVendor && currentVendor !== vendor) {
      set({
        items:         [{ ...item, qty: 1 }],
        vendor, vendorName, vendorAddress, categoryType, city,
      })
      return
    }

    const existing = items.find((i) => i.id === item.id)
    if (existing) {
      set({ items: items.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i) })
    } else {
      set({
        items: [...items, { ...item, qty: 1 }],
        vendor, vendorName, vendorAddress, categoryType, city,
      })
    }
  },

  removeItem: (itemId) => {
    const { items } = get()
    const updated = items
      .map((i) => i.id === itemId ? { ...i, qty: i.qty - 1 } : i)
      .filter((i) => i.qty > 0)
    set({ items: updated })
    if (updated.length === 0) get().clearCart()
  },

  clearCart: () => set({
    items: [], vendor: null, vendorName: null,
    vendorAddress: null, categoryType: null, city: null,
  }),

  totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),
  totalUsd:   () => get().items.reduce((sum, i) => sum + i.price_usd * i.qty, 0),
}))

export default useCartStore
