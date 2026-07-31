/**
 * ============================================================================
 * MZAYA
 * Component: DeliveryAddressCard
 * Path: frontend/src/components/checkout/DeliveryAddressCard.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Displays the customer's selected delivery address during checkout.
 *
 * Responsibilities
 * ----------------
 * • Show an address label, formatted address and optional delivery note.
 * • Communicate clearly when no address has been selected.
 * • Expose one edit/select action to the parent page.
 *
 * Data Contract
 * -------------
 * address may contain:
 * {
 *   label?: string,
 *   address_line_1?: string,
 *   address_line_2?: string,
 *   suburb?: string,
 *   city?: string,
 *   delivery_note?: string
 * }
 *
 * Compatibility Note
 * ------------------
 * The formatter supports both snake_case API fields and common camelCase fields
 * while the backend contract is being consolidated.
 *
 * Dependencies
 * ------------
 * • lucide-react
 *
 * Used By
 * -------
 * • CheckoutPage.jsx, normally inside CheckoutSection.jsx.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

import { ChevronRight, MapPin } from 'lucide-react'

function buildAddressLines(address) {
  if (!address) return []

  // Support current API naming and likely frontend-normalized naming.
  const firstLine = address.address_line_1 ?? address.addressLine1
  const secondLine = address.address_line_2 ?? address.addressLine2
  const locality = [address.suburb, address.city].filter(Boolean).join(', ')

  return [firstLine, secondLine, locality].filter(Boolean)
}

export default function DeliveryAddressCard({
  address,
  onChange,
  disabled = false,
}) {
  const addressLines = buildAddressLines(address)
  const hasAddress = addressLines.length > 0

  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className="flex w-full items-start gap-3 rounded-[18px] border p-4 text-left outline-none transition-[transform,border-color,box-shadow] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
      style={{
        background: hasAddress
          ? 'var(--mzaya-surface)'
          : 'var(--mzaya-surface-subtle)',
        borderColor: hasAddress
          ? 'var(--mzaya-border)'
          : 'var(--mzaya-border-strong)',
      }}
    >
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[14px]"
        style={{
          background: 'var(--mzaya-primary-soft)',
          color: 'var(--mzaya-primary)',
        }}
      >
        <MapPin aria-hidden="true" size={19} strokeWidth={1.8} />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className="text-[13px] font-semibold"
          style={{ color: 'var(--mzaya-text-primary)' }}
        >
          {hasAddress ? address.label || 'Delivery address' : 'Choose an address'}
        </p>

        {hasAddress ? (
          <>
            <p
              className="mt-1 text-[13px] leading-5"
              style={{ color: 'var(--mzaya-text-secondary)' }}
            >
              {addressLines.join(', ')}
            </p>

            {(address.delivery_note ?? address.deliveryNote) && (
              <p
                className="mt-1.5 text-[12px] leading-5"
                style={{ color: 'var(--mzaya-text-muted)' }}
              >
                Note: {address.delivery_note ?? address.deliveryNote}
              </p>
            )}
          </>
        ) : (
          <p
            className="mt-1 text-[12px] leading-5"
            style={{ color: 'var(--mzaya-text-muted)' }}
          >
            Add the location where this order should be delivered.
          </p>
        )}
      </div>

      <ChevronRight
        aria-hidden="true"
        className="mt-2 flex-shrink-0"
        size={18}
        strokeWidth={1.8}
        style={{ color: 'var(--mzaya-text-muted)' }}
      />
    </button>
  )
}
