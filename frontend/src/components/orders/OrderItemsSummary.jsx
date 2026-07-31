/**
 * ============================================================================
 * MZAYA
 * Component: OrderItemsSummary
 * Path: frontend/src/components/orders/OrderItemsSummary.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Presents the products included in an active or completed order.
 *
 * Responsibilities
 * ----------------
 * • Render compact line items with quantity and price.
 * • Support nested and flattened order-item response shapes.
 * • Display the total item count.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not modify quantities.
 * • Does not calculate delivery or service fees.
 * • Does not trigger reorders.
 *
 * Compatibility Note
 * ------------------
 * Older responses may place product fields directly on each order item. Newer
 * responses may nest them under item.product. Both formats are supported.
 *
 * Dependencies
 * ------------
 * • Money.jsx
 *
 * Used By
 * -------
 * • OrderTrackingPage.jsx
 * • OrderDetailsPage.jsx
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

import Money from '../ui/Money'

export default function OrderItemsSummary({
  items = [],
  title = 'Items',
}) {
  const itemCount = items.reduce(
    (total, item) => total + Number(item.quantity || 1),
    0
  )

  return (
    <section
      className="rounded-[22px] border bg-white p-5"
      style={{
        borderColor: 'var(--mzaya-border)',
        boxShadow: 'var(--mzaya-shadow-sm)',
      }}
      aria-labelledby="order-items-summary-heading"
    >
      <div className="flex items-center justify-between gap-4">
        <h2
          id="order-items-summary-heading"
          className="text-[16px] font-semibold"
          style={{ color: 'var(--mzaya-text-primary)' }}
        >
          {title}
        </h2>

        <span
          className="text-[12px]"
          style={{ color: 'var(--mzaya-text-muted)' }}
        >
          {itemCount} item{itemCount === 1 ? '' : 's'}
        </span>
      </div>

      <div
        className="mt-3 divide-y"
        style={{ borderColor: 'var(--mzaya-border)' }}
      >
        {items.map((item, index) => {
          const product = item.product ?? item
          const quantity = Number(item.quantity || 1)
          const unitPrice = Number(
            item.unit_price_usd ??
              item.price_usd ??
              product.price_usd ??
              0
          )
          const total = unitPrice * quantity

          return (
            <div
              key={item.id ?? item.order_item_id ?? `${item.product_id}-${index}`}
              className="flex items-start justify-between gap-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-[13px] font-medium"
                  style={{ color: 'var(--mzaya-text-primary)' }}
                >
                  {product.name}
                </p>

                <p
                  className="mt-1 text-[11px]"
                  style={{ color: 'var(--mzaya-text-muted)' }}
                >
                  Qty {quantity}
                  {(product.variant_name || item.variant_name) &&
                    ` · ${product.variant_name || item.variant_name}`}
                </p>
              </div>

              <Money usd={total} size="base" />
            </div>
          )
        })}
      </div>
    </section>
  )
}
