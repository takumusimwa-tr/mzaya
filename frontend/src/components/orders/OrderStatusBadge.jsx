/**
 * ============================================================================
 * MZAYA
 * Component: OrderStatusBadge
 * Path: frontend/src/components/orders/OrderStatusBadge.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Presents a compact, normalized order status across order lists and details.
 *
 * Responsibilities
 * ----------------
 * • Map normalized status values to customer-friendly labels.
 * • Apply restrained semantic styling.
 * • Support a custom label when backend terminology differs.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not normalize provider or backend status values.
 * • Does not infer whether an order is delayed.
 * • Does not trigger status updates.
 *
 * Expected Statuses
 * -----------------
 * pending | confirmed | preparing | ready | picked_up | on_the_way |
 * delivered | cancelled | failed | refunded
 *
 * Used By
 * -------
 * • OrderCard.jsx
 * • OrderDetailsPage.jsx
 * • OrderTrackingPage.jsx
 *
 * Developer Note
 * --------------
 * Normalize backend statuses in the order service or page adapter before
 * passing them into this component. Keep status copy customer-facing.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    background: 'var(--mzaya-warning-soft)',
    color: 'var(--mzaya-warning)',
  },
  confirmed: {
    label: 'Confirmed',
    background: 'var(--mzaya-primary-soft)',
    color: 'var(--mzaya-primary)',
  },
  preparing: {
    label: 'Preparing',
    background: 'var(--mzaya-primary-soft)',
    color: 'var(--mzaya-primary)',
  },
  ready: {
    label: 'Ready',
    background: 'var(--mzaya-primary-soft)',
    color: 'var(--mzaya-primary)',
  },
  picked_up: {
    label: 'Picked up',
    background: 'var(--mzaya-primary-soft)',
    color: 'var(--mzaya-primary)',
  },
  on_the_way: {
    label: 'On the way',
    background: 'var(--mzaya-primary-soft)',
    color: 'var(--mzaya-primary)',
  },
  delivered: {
    label: 'Delivered',
    background: 'var(--mzaya-success-soft)',
    color: 'var(--mzaya-success)',
  },
  cancelled: {
    label: 'Cancelled',
    background: 'var(--mzaya-surface-muted)',
    color: 'var(--mzaya-text-secondary)',
  },
  failed: {
    label: 'Failed',
    background: 'var(--mzaya-error-soft)',
    color: 'var(--mzaya-error)',
  },
  refunded: {
    label: 'Refunded',
    background: 'var(--mzaya-surface-muted)',
    color: 'var(--mzaya-text-secondary)',
  },
}

export default function OrderStatusBadge({
  status,
  label,
  className = '',
}) {
  const normalized = String(status || 'pending').toLowerCase()
  const config = STATUS_CONFIG[normalized] ?? STATUS_CONFIG.pending

  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full px-3 text-[11px] font-semibold ${className}`}
      style={{
        background: config.background,
        color: config.color,
      }}
    >
      {label || config.label}
    </span>
  )
}
