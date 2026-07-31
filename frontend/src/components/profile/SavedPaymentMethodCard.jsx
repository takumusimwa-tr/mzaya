/**
 * ============================================================================
 * MZAYA
 * Component: SavedPaymentMethodCard
 * Path: frontend/src/components/profile/SavedPaymentMethodCard.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Displays one tokenized payment method saved to the customer's account.
 *
 * Responsibilities
 * ----------------
 * • Show payment brand, masked identifier and expiry when available.
 * • Indicate the default payment method.
 * • Expose remove and set-default actions.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not collect payment credentials.
 * • Does not reveal raw card or wallet details.
 * • Does not tokenize or delete payment methods directly.
 *
 * Security Note
 * -------------
 * Only pass masked, provider-safe display values into this component. Never
 * pass PANs, CVVs, PINs, wallet secrets or gateway tokens into the UI layer.
 *
 * Dependencies
 * ------------
 * • Button.jsx
 * • lucide-react
 *
 * Used By
 * -------
 * • PaymentMethodsPage.jsx
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

import { CreditCard } from 'lucide-react'
import Button from '../ui/Button'

export default function SavedPaymentMethodCard({
  method,
  onRemove,
  onSetDefault,
}) {
  const isDefault = method?.is_default ?? method?.isDefault
  const brand = method?.brand || method?.provider || 'Payment method'
  const masked = method?.masked_label || method?.maskedLabel || method?.last4
  const expiry = method?.expiry_label || method?.expiryLabel

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
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px]"
          style={{
            background: 'var(--mzaya-surface-muted)',
            color: 'var(--mzaya-text-secondary)',
          }}
        >
          <CreditCard aria-hidden="true" size={19} strokeWidth={1.8} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2
              className="text-[14px] font-semibold"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              {brand}
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

          {masked && (
            <p
              className="mt-1 text-[13px]"
              style={{ color: 'var(--mzaya-text-secondary)' }}
            >
              {String(masked).length === 4 ? `•••• ${masked}` : masked}
            </p>
          )}

          {expiry && (
            <p
              className="mt-1 text-[11px]"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              Expires {expiry}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {!isDefault && onSetDefault && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onSetDefault(method)}
          >
            Set as default
          </Button>
        )}

        {onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(method)}
            style={{ color: 'var(--mzaya-error)' }}
          >
            Remove
          </Button>
        )}
      </div>
    </article>
  )
}
