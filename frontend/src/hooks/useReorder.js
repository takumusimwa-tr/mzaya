import { useNavigate } from 'react-router-dom'
import useCartStore from '../store/useCartStore'

// Rebuilds the cart from a past order, then routes to the cart.
export default function useReorder() {
  const navigate = useNavigate()
  const cart     = useCartStore()

  // order: the full order object (with foodDetail/groceryDetail/etc.)
  const reorder = (order) => {
    const detail = order.foodDetail || order.groceryDetail || order.materialsDetail || order.errandDetail
    if (!detail || !detail.items?.length) {
      alert('This order has no items to reorder')
      return
    }

    // Resolve vendor identity per category
    const vendorId =
      detail.restaurant_id || detail.store_id || detail.supplier_id || detail.vendor_id
    const vendorName =
      detail.restaurant_name || detail.store_name || detail.supplier_name || detail.vendor_name || 'Vendor'

    if (!vendorId) {
      alert('Could not identify the vendor for this order')
      return
    }

    // Clear current cart and rebuild
    cart.clearCart()

    detail.items.forEach((item) => {
      cart.addItem({
        id:                   item.menu_item_id || item.id,
        name:                 item.name,
        unit_price_usd:       Number(item.unit_price_usd),
        qty:                  item.qty || 1,
        special_instructions: item.special_instructions || null,
        weight_kg:            item.weight_kg || 0.5,
      }, {
        vendorId,
        vendorName,
        vendorAddress: order.pickup_address,
        categoryType:  order.category_type,
      })
    })

    navigate('/cart')
  }

  return reorder
}
