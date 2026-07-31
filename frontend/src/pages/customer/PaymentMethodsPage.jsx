/**
 * ============================================================================
 * MZAYA
 * Page: PaymentMethodsPage
 * Path: frontend/src/pages/customer/PaymentMethodsPage.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Composes the customer's saved payment-method experience using the canonical
 * Mzaya profile payment component.
 *
 * Responsibilities
 * ----------------
 * • Display saved payment methods.
 * • Surface default-payment status.
 * • Expose add, remove and set-default actions.
 * • Render loading, error and empty states.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not fetch or persist payment methods.
 * • Does not tokenize cards or mobile-money credentials.
 * • Does not display full PAN, CVV, PIN, wallet secrets or gateway tokens.
 * • Does not confirm destructive removal.
 * • Does not navigate directly.
 *
 * Canonical Component Policy
 * --------------------------
 * This page composes:
 *
 *   frontend/src/components/profile/SavedPaymentMethodCard.jsx
 *
 * Older page-local payment cards, brand rows, default badges and removal
 * actions should be retired during the final deduplication pass.
 *
 * Integration Contract
 * --------------------
 * The connected page/container should:
 * 1. Fetch normalized, display-safe payment-method data.
 * 2. Handle navigation to the secure add-payment flow.
 * 3. Confirm removal before calling onRemove.
 * 4. Persist the default payment method through the backend.
 *
 * Props
 * -----
 * paymentMethods?: Array<PaymentMethod>
 * loading?: boolean
 * error?: string | null
 * removingId?: string | number | null
 * settingDefaultId?: string | number | null
 * onBack?: () => void
 * onRetry?: () => void
 * onAddPaymentMethod?: () => void
 * onRemovePaymentMethod?: (method: PaymentMethod) => void
 * onSetDefault?: (method: PaymentMethod) => void
 *
 * Dependencies
 * ------------
 * • AppHeader.jsx
 * • PageShell.jsx
 * • Button.jsx
 * • SavedPaymentMethodCard.jsx
 * • lucide-react
 *
 * Security Notes
 * --------------
 * Only masked, display-approved values should reach this page. Sensitive payment
 * credentials must remain inside the provider or backend-controlled flow.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial page composition.
 * ============================================================================
 */

import { CreditCard, Plus } from 'lucide-react'
import AppHeader from '../../components/layout/AppHeader'
import PageShell from '../../components/layout/PageShell'
import Button from '../../components/ui/Button'
import SavedPaymentMethodCard from '../../components/profile/SavedPaymentMethodCard'

function PaymentMethodSkeleton() {
  return (
    <div
      className="animate-pulse rounded-[22px] border bg-white p-5"
      style={{
        borderColor: 'var(--mzaya-border)',
        boxShadow: 'var(--mzaya-shadow-sm)',
      }}
      aria-hidden="true"
    >
      <div className="flex items-start gap-3">
        <div
          className="h-11 w-11 rounded-[14px]"
          style={{ background: 'var(--mzaya-surface-muted)' }}
        />

        <div className="flex-1">
          <div
            className="h-4 w-32 rounded-full"
            style={{ background: 'var(--mzaya-surface-muted)' }}
          />
          <div
            className="mt-3 h-3 w-44 rounded-full"
            style={{ background: 'var(--mzaya-surface-muted)' }}
          />
          <div
            className="mt-2 h-3 w-28 rounded-full"
            style={{ background: 'var(--mzaya-surface-muted)' }}
          />
        </div>
      </div>

      <div
        className="mt-5 h-10 w-full rounded-[14px]"
        style={{ background: 'var(--mzaya-surface-muted)' }}
      />
    </div>
  )
}

export default function PaymentMethodsPage({
  paymentMethods = [],
  loading = false,
  error = null,
  removingId = null,
  settingDefaultId = null,
  onBack,
  onRetry,
  onAddPaymentMethod,
  onRemovePaymentMethod,
  onSetDefault,
}) {
  return (
    <PageShell>
      <AppHeader
        title="Payment methods"
        subtitle="Manage secure ways to pay with Mzaya."
        onBack={onBack}
      />

      <main
        className="mx-auto w-full max-w-3xl px-4 pb-12 pt-4 sm:px-6"
        aria-live="polite"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <p
            className="text-[12px]"
            style={{ color: 'var(--mzaya-text-muted)' }}
          >
            {paymentMethods.length} saved method
            {paymentMethods.length === 1 ? '' : 's'}
          </p>

          {onAddPaymentMethod && (
            <Button leadingIcon={Plus} onClick={onAddPaymentMethod}>
              Add method
            </Button>
          )}
        </div>

        {loading ? (
          <div className="space-y-4" aria-label="Loading payment methods">
            <PaymentMethodSkeleton />
            <PaymentMethodSkeleton />
          </div>
        ) : error ? (
          <section
            className="rounded-[24px] border bg-white px-6 py-12 text-center"
            style={{
              borderColor: 'var(--mzaya-border)',
              boxShadow: 'var(--mzaya-shadow-sm)',
            }}
          >
            <h1
              className="text-[20px] font-semibold"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              We could not load payment methods
            </h1>

            <p
              className="mx-auto mt-2 max-w-[380px] text-[13px] leading-6"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              {error}
            </p>

            {onRetry && (
              <Button onClick={onRetry} className="mt-6 min-w-[140px]">
                Try again
              </Button>
            )}
          </section>
        ) : paymentMethods.length ? (
          <section className="space-y-4" aria-label="Saved payment methods">
            {paymentMethods.map((method) => {
              const id =
                method.id ??
                method.payment_method_id ??
                method.paymentMethodId

              return (
                <SavedPaymentMethodCard
                  key={id ?? `${method.provider}-${method.last4}`}
                  method={method}
                  removing={removingId === id}
                  settingDefault={settingDefaultId === id}
                  onRemove={
                    onRemovePaymentMethod
                      ? () => onRemovePaymentMethod(method)
                      : undefined
                  }
                  onSetDefault={
                    onSetDefault
                      ? () => onSetDefault(method)
                      : undefined
                  }
                />
              )
            })}
          </section>
        ) : (
          <section
            className="rounded-[24px] border bg-white px-6 py-12 text-center"
            style={{
              borderColor: 'var(--mzaya-border)',
              boxShadow: 'var(--mzaya-shadow-sm)',
            }}
          >
            <div
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px]"
              style={{
                background: 'var(--mzaya-primary-soft)',
                color: 'var(--mzaya-primary)',
              }}
            >
              <CreditCard aria-hidden="true" size={24} strokeWidth={1.8} />
            </div>

            <h1
              className="mt-5 text-[20px] font-semibold"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              No saved payment methods
            </h1>

            <p
              className="mx-auto mt-2 max-w-[360px] text-[13px] leading-6"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              Add a secure payment method to make checkout faster.
            </p>

            {onAddPaymentMethod && (
              <Button
                leadingIcon={Plus}
                onClick={onAddPaymentMethod}
                className="mt-6"
              >
                Add your first method
              </Button>
            )}
          </section>
        )}

        <p
          className="mx-auto mt-6 max-w-[520px] text-center text-[11px] leading-5"
          style={{ color: 'var(--mzaya-text-muted)' }}
        >
          Mzaya only displays masked payment details. Sensitive credentials are
          handled by the payment provider and are never shown on this page.
        </p>
      </main>
    </PageShell>
  )
}
