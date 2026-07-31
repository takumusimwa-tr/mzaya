/**
 * ============================================================================
 * MZAYA
 * Component: OrderCard
 * Path: frontend/src/components/orders/OrderCard.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Represents one order in the customer's active or historical order list.
 *
 * Responsibilities
 * ----------------
 * • Display merchant, reference, status, date and total.
 * • Show a concise product summary when available.
 * • Expose a primary order action supplied by the parent page.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not navigate directly.
 * • Does not fetch order details.
 * • Does not determine whether tracking or reordering is available.
 *
 * Data Contract
 * -------------
 * order: {
 *   id?: string | number,
 *   reference?: string,
 *   status?: string,
 *   merchant?: { name?: string },
 *   merchant_name?: string,
 *   total_usd?: number,
 *   total?: number,
 *   created_at?: string,
 *   placed_at_label?: string,
 *   items?: Array
 * }
 *
 * Dependencies
 * ------------
 * • Money.jsx
 * • OrderStatusBadge.jsx
 * • lucide-react
 *
 * Used By
 * -------
 * • OrdersPage.jsx
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

import { ChevronRight, Store } from 'lucide-react'
import Money from '../ui/Money'
import OrderStatusBadge from './OrderStatusBadge'

function buildItemSummary(items = []) {
  if (!items.length) return 'Order details'

  const names = items
    .map((item) => item.product?.name ?? item.name)
    .filter(Boolean)

  if (!names.length) return `${items.length} item${items.length === 1 ? '' : 's'}`
  if (names.length === 1) return names[0]
  if (names.length === 2) return names.join(' and ')

  return `${names[0]}, ${names[1]} +${names.length - 2} more`
}

export default function OrderCard({
  order,
  actionLabel = 'View order',
  onAction,
}) {
  const merchantName = order.merchant?.name ?? order.merchant_name ?? 'Merchant'
  const total = Number(order.total_usd ?? order.total ?? 0)
  const reference = order.reference ?? order.order_reference ?? order.id
  const placedAt = order.placed_at_label ?? order.created_at_label ?? order.created_at

  return (
    <article
      className="rounded-[22px] border bg-white p-5"
      style={{
        borderColor: 'var(--mzaya-border)',
        boxShadow: 'var(--mzaya-shadow-sm)',
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Store
              aria-hidden="true"
              size={15}
              strokeWidth={1.8}
              style={{ color: 'var(--mzaya-text-muted)' }}
            />
            <h2
              className="truncate text-[15px] font-semibold"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              {merchantName}
            </h2>
          </div>

          <p
            className="mt-2 truncate text-[12px]"
            style={{ color: 'var(--mzaya-text-muted)' }}
          >
            {buildItemSummary(order.items)}
          </p>
        </div>

        <OrderStatusBadge status={order.status} />
      </div>

      <div
        className="mt-4 flex items-end justify-between gap-4 border-t pt-4"
        style={{ borderColor: 'var(--mzaya-border)' }}
      >
        <div>
          <p
            className="text-[11px]"
            style={{ color: 'var(--mzaya-text-muted)' }}
          >
            {reference ? `Order ${reference}` : 'Order'}
            {placedAt ? ` · ${placedAt}` : ''}
          </p>

          <div className="mt-1">
            <Money usd={total} size="base" />
          </div>
        </div>

        {onAction && (
          <button
            type="button"
            onClick={() => onAction(order)}
            className="inline-flex items-center gap-1 text-[12px] font-semibold outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
            style={{ color: 'var(--mzaya-primary)' }}
          >
            {actionLabel}
            <ChevronRight aria-hidden="true" size={15} strokeWidth={1.9} />
          </button>
        )}
      </div>
    </article>
  )
}
