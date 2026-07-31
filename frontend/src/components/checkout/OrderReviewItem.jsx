/**
 * ============================================================================
 * MZAYA
 * Component: OrderReviewItem
 * Path: frontend/src/components/checkout/OrderReviewItem.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Displays a read-only cart line during final checkout review.
 *
 * Responsibilities
 * ----------------
 * • Show product name, quantity, optional variant and line total.
 * • Present a compact layout appropriate for checkout review.
 * • Support current nested and flattened cart item shapes.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not change quantity.
 * • Does not remove products.
 * • Does not calculate taxes, delivery fees or order totals.
 *
 * Compatibility Note
 * ------------------
 * Older responses may provide product fields directly on the item. Newer
 * responses may nest product data under item.product. Both are supported here.
 *
 * Dependencies
 * ------------
 * • Money.jsx
 * • imageUrl()
 * • lucide-react
 *
 * Used By
 * -------
 * • CheckoutPage.jsx
 * • OrderReviewList.jsx
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

import { PackageOpen } from 'lucide-react'
import Money from '../ui/Money'
import imageUrl from '../../utils/imageUrl'

export default function OrderReviewItem({ item }) {
  // Preserve compatibility while the API response shape is standardized.
  const product = item.product ?? item
  const quantity = Number(item.quantity || 1)
  const unitPrice = Number(
    item.unit_price_usd ??
      item.price_usd ??
      product.price_usd ??
      0
  )
  const lineTotal = unitPrice * quantity

  return (
    <article className="flex items-center gap-3 py-3">
      <div
        className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-[14px]"
        style={{ background: 'var(--mzaya-surface-muted)' }}
      >
        {product.image_url ? (
          <img
            src={imageUrl(product.image_url, 180)}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <PackageOpen
            aria-hidden="true"
            size={20}
            strokeWidth={1.5}
            style={{ color: 'var(--mzaya-neutral-400)' }}
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className="truncate text-[13px] font-semibold"
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

      <Money usd={lineTotal} size="base" />
    </article>
  )
}
