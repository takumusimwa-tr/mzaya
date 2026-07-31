/**
 * ============================================================================
 * MZAYA
 * Component: OrderReviewList
 * Path: frontend/src/components/checkout/OrderReviewList.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Presents the products included in the order immediately before payment.
 *
 * Responsibilities
 * ----------------
 * • Render OrderReviewItem for each cart line.
 * • Provide a concise item count.
 * • Allow the customer to return to the cart through an optional edit action.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not own cart state.
 * • Does not modify quantities.
 * • Does not perform pricing calculations beyond each line-item component.
 *
 * Dependencies
 * ------------
 * • OrderReviewItem.jsx
 *
 * Used By
 * -------
 * • CheckoutPage.jsx, normally inside CheckoutSection.jsx.
 *
 * Design Notes
 * ------------
 * This is intentionally denser than CartItem.jsx because checkout is a review
 * step, not the primary place for editing the basket.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

import OrderReviewItem from './OrderReviewItem'

export default function OrderReviewList({
  items = [],
  onEdit,
}) {
  const itemCount = items.reduce(
    (total, item) => total + Number(item.quantity || 1),
    0
  )

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p
          className="text-[12px] font-medium"
          style={{ color: 'var(--mzaya-text-muted)' }}
        >
          {itemCount} item{itemCount === 1 ? '' : 's'}
        </p>

        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-[12px] font-semibold outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
            style={{ color: 'var(--mzaya-primary)' }}
          >
            Edit cart
          </button>
        )}
      </div>

      <div
        className="mt-2 divide-y"
        style={{ borderColor: 'var(--mzaya-border)' }}
      >
        {items.map((item, index) => (
          <OrderReviewItem
            key={item.id ?? item.cart_item_id ?? `${item.product_id}-${index}`}
            item={item}
          />
        ))}
      </div>
    </div>
  )
}
