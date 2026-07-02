import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCartStore = create(
  persist(
    (set, get) => ({
      items:         [],
      vendorId:      null,
      vendorName:    null,
      vendorAddress: null,
      vendorCity:    null,   // vendor's city slug (e.g. 'harare') — decides order city
      categoryType:  null,

      // Add item — enforces single-vendor cart
      addItem: (item, vendorInfo) => {
        const state = get()

        // If adding from a different vendor, clear cart first
        if (state.vendorId && state.vendorId !== vendorInfo.vendorId) {
          if (!confirm(`Your cart has items from ${state.vendorName}. Clear it and add from ${vendorInfo.vendorName}?`)) {
            return
          }
          set({
            items:         [{ ...item }],
            vendorId:      vendorInfo.vendorId,
            vendorName:    vendorInfo.vendorName,
            vendorAddress: vendorInfo.vendorAddress,
            vendorCity:    vendorInfo.vendorCity || null,
            categoryType:  vendorInfo.categoryType,
          })
          return
        }

        // Same vendor or empty cart
        const existing = state.items.find(
          (i) => i.id === item.id && i.special_instructions === item.special_instructions
        )

        if (existing) {
          set({
            items: state.items.map((i) =>
              i === existing ? { ...i, qty: i.qty + item.qty } : i
            ),
          })
        } else {
          set({
            items:         [...state.items, item],
            vendorId:      vendorInfo.vendorId,
            vendorName:    vendorInfo.vendorName,
            vendorAddress: vendorInfo.vendorAddress,
            vendorCity:    vendorInfo.vendorCity || null,
            categoryType:  vendorInfo.categoryType,
          })
        }
      },

      removeItem: (index) => {
        const items = get().items.filter((_, i) => i !== index)
        set(items.length === 0
          ? { items: [], vendorId: null, vendorName: null, vendorAddress: null, vendorCity: null, categoryType: null }
          : { items }
        )
      },

      updateQty: (index, qty) => {
        if (qty < 1) return
        set({
          items: get().items.map((item, i) => (i === index ? { ...item, qty } : item)),
        })
      },

      clearCart: () => set({
        items: [], vendorId: null, vendorName: null, vendorAddress: null, vendorCity: null, categoryType: null,
      }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),

      totalPrice: () => get().items.reduce((sum, i) => sum + i.unit_price_usd * i.qty, 0),

      totalWeight: () => get().items.reduce((sum, i) => sum + (i.weight_kg || 0.5) * i.qty, 0),
    }),
    { name: 'mzaya-cart' }
  )
)

export default useCartStore
