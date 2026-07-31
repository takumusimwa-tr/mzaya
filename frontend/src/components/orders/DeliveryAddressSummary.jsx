/**
 * ============================================================================
 * MZAYA
 * Component: DeliveryAddressSummary
 * Path: frontend/src/components/orders/DeliveryAddressSummary.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Displays the confirmed delivery destination on an active or completed order.
 *
 * Responsibilities
 * ----------------
 * • Show a compact formatted address.
 * • Display optional recipient and delivery note information.
 * • Support current snake_case and camelCase address fields.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not edit the delivery address.
 * • Does not geocode or validate the address.
 * • Does not reveal hidden address metadata.
 *
 * Data Contract
 * -------------
 * address?: {
 *   label?: string,
 *   address_line_1?: string,
 *   address_line_2?: string,
 *   suburb?: string,
 *   city?: string,
 *   recipient_name?: string,
 *   delivery_note?: string
 * }
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

import { MapPin, UserRound } from 'lucide-react'

function getAddressLines(address) {
  if (!address) return []

  const firstLine = address.address_line_1 ?? address.addressLine1
  const secondLine = address.address_line_2 ?? address.addressLine2
  const locality = [address.suburb, address.city].filter(Boolean).join(', ')

  return [firstLine, secondLine, locality].filter(Boolean)
}

export default function DeliveryAddressSummary({ address }) {
  const lines = getAddressLines(address)
  const recipient = address?.recipient_name ?? address?.recipientName
  const note = address?.delivery_note ?? address?.deliveryNote

  return (
    <section
      className="rounded-[22px] border bg-white p-5"
      style={{
        borderColor: 'var(--mzaya-border)',
        boxShadow: 'var(--mzaya-shadow-sm)',
      }}
      aria-labelledby="delivery-address-summary-heading"
    >
      <div className="flex items-start gap-3">
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
          <h2
            id="delivery-address-summary-heading"
            className="text-[14px] font-semibold"
            style={{ color: 'var(--mzaya-text-primary)' }}
          >
            {address?.label || 'Delivery address'}
          </h2>

          <p
            className="mt-1 text-[13px] leading-5"
            style={{ color: 'var(--mzaya-text-secondary)' }}
          >
            {lines.length ? lines.join(', ') : 'Address unavailable'}
          </p>

          {recipient && (
            <div className="mt-3 flex items-center gap-2">
              <UserRound
                aria-hidden="true"
                size={14}
                strokeWidth={1.8}
                style={{ color: 'var(--mzaya-text-muted)' }}
              />
              <span
                className="text-[12px]"
                style={{ color: 'var(--mzaya-text-muted)' }}
              >
                {recipient}
              </span>
            </div>
          )}

          {note && (
            <p
              className="mt-2 text-[12px] leading-5"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              Note: {note}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
