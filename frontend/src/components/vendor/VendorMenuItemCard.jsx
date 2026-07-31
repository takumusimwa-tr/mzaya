/**
 * ============================================================================
 * MZAYA
 * Component: VendorMenuItemCard
 * Path: frontend/src/components/vendor/VendorMenuItemCard.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Canonical vendor menu-item card.
 *
 * Responsibilities
 * ----------------
 * • Display product image, name, description, price and availability.
 * • Forward availability, edit and delete actions.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not persist item changes.
 * • Does not confirm destructive actions.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial canonical component.
 * ============================================================================
 */

import { Clock3, Image as ImageIcon, Pencil, Trash2 } from 'lucide-react'
import imageUrl from '../../utils/imageUrl'

export default function VendorMenuItemCard({
  item,
  busy = false,
  onToggleAvailability,
  onEdit,
  onDelete,
}) {
  const unavailable = item.is_available === false

  return (
    <article
      className="rounded-[22px] border bg-white p-4"
      style={{
        borderColor: 'var(--mzaya-border)',
        boxShadow: 'var(--mzaya-shadow-sm)',
        opacity: unavailable ? 0.72 : 1,
      }}
    >
      <div className="flex gap-4">
        <div
          className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-[18px]"
          style={{ background: 'var(--mzaya-surface-muted)' }}
        >
          {item.image_url ? (
            <img
              src={imageUrl(item.image_url, 320)}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageIcon
              size={22}
              strokeWidth={1.7}
              aria-hidden="true"
              style={{ color: 'var(--mzaya-text-muted)' }}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3
                className="text-[14px] font-semibold"
                style={{ color: 'var(--mzaya-text-primary)' }}
              >
                {item.name}
              </h3>
              {unavailable && (
                <span
                  className="mt-1 inline-flex rounded-full px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em]"
                  style={{
                    background: 'var(--mzaya-error-soft)',
                    color: 'var(--mzaya-error)',
                  }}
                >
                  Unavailable
                </span>
              )}
            </div>

            <p
              className="text-[14px] font-semibold"
              style={{ color: 'var(--mzaya-primary)' }}
            >
              US${Number(item.price_usd || 0).toFixed(2)}
            </p>
          </div>

          {item.description && (
            <p
              className="mt-2 line-clamp-2 text-[11px] leading-5"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              {item.description}
            </p>
          )}

          {Number(item.prep_minutes) > 0 && (
            <p
              className="mt-2 inline-flex items-center gap-1 text-[10px]"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              <Clock3 size={12} strokeWidth={1.8} aria-hidden="true" />
              About {item.prep_minutes} minutes
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4"
        style={{ borderColor: 'var(--mzaya-border)' }}>
        <button
          type="button"
          disabled={busy}
          onClick={() => onToggleAvailability?.(item, unavailable)}
          className="rounded-[12px] px-3 py-2 text-[11px] font-semibold outline-none disabled:opacity-50 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
          style={{
            background: unavailable
              ? 'var(--mzaya-primary-soft)'
              : 'var(--mzaya-warning-soft)',
            color: unavailable
              ? 'var(--mzaya-primary)'
              : 'var(--mzaya-warning-text)',
          }}
        >
          {unavailable ? 'Mark available' : 'Mark unavailable'}
        </button>

        <button
          type="button"
          onClick={() => onEdit?.(item)}
          className="inline-flex items-center gap-1 rounded-[12px] px-3 py-2 text-[11px] font-semibold outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
          style={{
            background: 'var(--mzaya-surface-muted)',
            color: 'var(--mzaya-text-secondary)',
          }}
        >
          <Pencil size={13} strokeWidth={1.8} aria-hidden="true" />
          Edit
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={() => onDelete?.(item)}
          className="ml-auto inline-flex items-center gap-1 rounded-[12px] px-3 py-2 text-[11px] font-semibold outline-none disabled:opacity-50 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
          style={{
            background: 'var(--mzaya-error-soft)',
            color: 'var(--mzaya-error)',
          }}
        >
          <Trash2 size={13} strokeWidth={1.8} aria-hidden="true" />
          Delete
        </button>
      </div>
    </article>
  )
}
