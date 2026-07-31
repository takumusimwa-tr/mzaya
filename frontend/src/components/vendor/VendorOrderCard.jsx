/**
 * ============================================================================
 * MZAYA
 * Component: VendorOrderCard
 * Path: frontend/src/components/vendor/VendorOrderCard.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Canonical compact order card used in the vendor order master list.
 *
 * Responsibilities
 * ----------------
 * • Display order reference, destination, item count, status and subtotal.
 * • Forward selection to the owning page.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not derive order workflow eligibility.
 * • Does not mutate order state.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial canonical component.
 * ============================================================================
 */

import Badge from '../ui/Badge'
import { MapPin } from 'lucide-react'

function orderDetail(order) {
  return (
    order.foodDetail ||
    order.groceryDetail ||
    order.materialsDetail ||
    order.errandDetail
  )
}

export default function VendorOrderCard({ order, selected = false, onSelect }) {
  const detail = orderDetail(order)
  const itemCount = detail?.items?.length || 0
  const reference = order.id?.slice(0, 8)?.toUpperCase() || 'ORDER'

  return (
    <button
      type="button"
      onClick={() => onSelect?.(order)}
      className="w-full rounded-[20px] border bg-white p-4 text-left outline-none transition hover:-translate-y-0.5 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
      style={{
        borderColor: selected
          ? 'var(--mzaya-primary)'
          : 'var(--mzaya-border)',
        boxShadow: selected
          ? '0 10px 28px rgba(8, 77, 55, 0.10)'
          : 'var(--mzaya-shadow-xs)',
      }}
      aria-pressed={selected}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.12em]"
          style={{ color: 'var(--mzaya-text-muted)' }}
        >
          #{reference}
        </span>
        <Badge
          label={(order.status || '').replaceAll('_', ' ')}
          type={order.status}
        />
      </div>

      <div className="mt-3 flex items-start gap-2">
        <MapPin
          size={15}
          strokeWidth={1.8}
          aria-hidden="true"
          style={{ color: 'var(--mzaya-primary)' }}
        />
        <p
          className="line-clamp-2 text-[12px] leading-5"
          style={{ color: 'var(--mzaya-text-secondary)' }}
        >
          {order.dropoff_address || 'Delivery address unavailable'}
        </p>
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <span
          className="text-[11px]"
          style={{ color: 'var(--mzaya-text-muted)' }}
        >
          {itemCount} item{itemCount === 1 ? '' : 's'}
        </span>
        <span
          className="text-[14px] font-semibold"
          style={{ color: 'var(--mzaya-text-primary)' }}
        >
          US${Number(order.subtotal_usd || 0).toFixed(2)}
        </span>
      </div>
    </button>
  )
}
