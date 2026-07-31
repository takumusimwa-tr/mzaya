/**
 * ============================================================================
 * MZAYA
 * Component: AddressBookCard
 * Path: frontend/src/components/profile/AddressBookCard.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Displays one saved customer address inside the account address book.
 *
 * Responsibilities
 * ----------------
 * • Show the address label and formatted destination.
 * • Indicate the default address.
 * • Expose edit, delete and set-default actions supplied by the parent.
 * • Support snake_case and camelCase API response fields.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not validate or geocode addresses.
 * • Does not mutate address records.
 * • Does not confirm destructive actions.
 *
 * Data Contract
 * -------------
 * address: {
 *   id: string | number,
 *   label?: string,
 *   address_line_1?: string,
 *   address_line_2?: string,
 *   suburb?: string,
 *   city?: string,
 *   is_default?: boolean,
 *   delivery_note?: string
 * }
 *
 * Dependencies
 * ------------
 * • Button.jsx
 * • lucide-react
 *
 * Used By
 * -------
 * • SavedAddressesPage.jsx
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

import { MapPin, MoreHorizontal } from 'lucide-react'
import Button from '../ui/Button'

function formatAddress(address) {
  const line1 = address?.address_line_1 ?? address?.addressLine1
  const line2 = address?.address_line_2 ?? address?.addressLine2
  const locality = [address?.suburb, address?.city].filter(Boolean).join(', ')

  return [line1, line2, locality].filter(Boolean).join(', ')
}

export default function AddressBookCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}) {
  const isDefault = address?.is_default ?? address?.isDefault
  const note = address?.delivery_note ?? address?.deliveryNote

  return (
    <article
      className="rounded-[22px] border bg-white p-5"
      style={{
        borderColor: 'var(--mzaya-border)',
        boxShadow: 'var(--mzaya-shadow-sm)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[14px]"
          style={{
            background: 'var(--mzaya-primary-soft)',
            color: 'var(--mzaya-primary)',
          }}
        >
          <MapPin aria-hidden="true" size={18} strokeWidth={1.8} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2
              className="text-[14px] font-semibold"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              {address?.label || 'Saved address'}
            </h2>

            {isDefault && (
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
                style={{
                  background: 'var(--mzaya-primary-soft)',
                  color: 'var(--mzaya-primary)',
                }}
              >
                Default
              </span>
            )}
          </div>

          <p
            className="mt-2 text-[13px] leading-5"
            style={{ color: 'var(--mzaya-text-secondary)' }}
          >
            {formatAddress(address) || 'Address unavailable'}
          </p>

          {note && (
            <p
              className="mt-2 text-[12px] leading-5"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              Note: {note}
            </p>
          )}
        </div>

        <MoreHorizontal
          aria-hidden="true"
          size={18}
          strokeWidth={1.8}
          style={{ color: 'var(--mzaya-text-muted)' }}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {onEdit && (
          <Button variant="outline" size="sm" onClick={() => onEdit(address)}>
            Edit
          </Button>
        )}

        {!isDefault && onSetDefault && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onSetDefault(address)}
          >
            Set as default
          </Button>
        )}

        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(address)}
            style={{ color: 'var(--mzaya-error)' }}
          >
            Delete
          </Button>
        )}
      </div>
    </article>
  )
}
