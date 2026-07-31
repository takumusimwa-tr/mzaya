/**
 * ============================================================================
 * MZAYA
 * Page: OrderCancellationPage
 * Path: frontend/src/pages/customer/OrderCancellationPage.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Composes a controlled order-cancellation request experience.
 *
 * Responsibilities
 * ----------------
 * • Display order context and application-approved cancellation reasons.
 * • Display any cancellation policy text supplied by the parent.
 * • Forward reason selection and cancellation confirmation.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not determine cancellation eligibility.
 * • Does not calculate refunds or fees.
 * • Does not cancel orders.
 * • Does not navigate directly.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial page composition.
 * ============================================================================
 */

import { ArrowLeft, CircleAlert } from 'lucide-react'
import PageShell from '../../components/layout/PageShell'
import Button from '../../components/ui/Button'

export default function OrderCancellationPage({
  order,
  reasons = [],
  selectedReasonId = null,
  customReason = '',
  policyMessage,
  cancelling = false,
  error = null,
  onBack,
  onReasonChange,
  onCustomReasonChange,
  onConfirmCancellation,
}) {
  const selectedReason = reasons.find(
    (reason) => reason.id === selectedReasonId
  )
  const requiresText = Boolean(selectedReason?.requires_text)

  return (
    <PageShell>
      <main
        className="mx-auto w-full max-w-2xl px-4 pb-12 pt-4 sm:px-6"
        aria-live="polite"
      >
        <header className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-11 w-11 items-center justify-center rounded-[15px] border bg-white outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
            style={{
              borderColor: 'var(--mzaya-border)',
              color: 'var(--mzaya-text-primary)',
            }}
            aria-label="Go back"
          >
            <ArrowLeft size={19} strokeWidth={1.8} />
          </button>
          <div>
            <h1
              className="text-[24px] font-semibold tracking-[-0.035em]"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              Cancel order
            </h1>
            <p
              className="mt-1 text-[12px]"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              Tell us why you need to cancel.
            </p>
          </div>
        </header>

        {order && (
          <section
            className="mt-6 rounded-[20px] border p-4"
            style={{
              borderColor: 'var(--mzaya-border)',
              background: 'var(--mzaya-primary-soft)',
            }}
          >
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: 'var(--mzaya-primary)' }}
            >
              Order
            </p>
            <p
              className="mt-2 text-[13px] font-semibold"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              {order.merchant_name ?? order.merchantName ?? 'Mzaya order'}
            </p>
            <p
              className="mt-1 text-[11px]"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              {order.reference ?? order.order_reference ?? order.orderReference}
            </p>
          </section>
        )}

        {policyMessage && (
          <section
            className="mt-4 flex gap-3 rounded-[18px] border p-4"
            style={{
              borderColor: 'var(--mzaya-border)',
              background: 'var(--mzaya-surface)',
            }}
          >
            <CircleAlert
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
              style={{ color: 'var(--mzaya-warning)' }}
            />
            <p
              className="text-[12px] leading-5"
              style={{ color: 'var(--mzaya-text-secondary)' }}
            >
              {policyMessage}
            </p>
          </section>
        )}

        <section className="mt-6" aria-labelledby="cancellation-reason-heading">
          <h2
            id="cancellation-reason-heading"
            className="text-[15px] font-semibold"
            style={{ color: 'var(--mzaya-text-primary)' }}
          >
            Select a reason
          </h2>

          <div className="mt-3 space-y-2">
            {reasons.map((reason) => {
              const selected = selectedReasonId === reason.id
              return (
                <button
                  key={reason.id}
                  type="button"
                  onClick={() => onReasonChange?.(reason)}
                  className="flex w-full items-center gap-3 rounded-[17px] border px-4 py-3 text-left outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                  style={{
                    borderColor: selected
                      ? 'var(--mzaya-primary)'
                      : 'var(--mzaya-border)',
                    background: selected
                      ? 'var(--mzaya-primary-soft)'
                      : 'var(--mzaya-surface)',
                  }}
                  aria-pressed={selected}
                >
                  <span
                    className="flex h-4 w-4 items-center justify-center rounded-full border"
                    style={{
                      borderColor: selected
                        ? 'var(--mzaya-primary)'
                        : 'var(--mzaya-border-strong)',
                    }}
                    aria-hidden="true"
                  >
                    {selected && (
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: 'var(--mzaya-primary)' }}
                      />
                    )}
                  </span>
                  <span
                    className="text-[12px] font-medium"
                    style={{ color: 'var(--mzaya-text-primary)' }}
                  >
                    {reason.label ?? reason.name}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {requiresText && (
          <div className="mt-5">
            <label
              htmlFor="custom-cancellation-reason"
              className="text-[13px] font-semibold"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              Add more detail
            </label>
            <textarea
              id="custom-cancellation-reason"
              rows={4}
              value={customReason}
              onChange={(event) =>
                onCustomReasonChange?.(event.target.value)
              }
              className="mt-2 w-full resize-none rounded-[16px] border px-4 py-3 text-[13px] leading-6 outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
              style={{
                borderColor: 'var(--mzaya-border)',
                color: 'var(--mzaya-text-primary)',
              }}
            />
          </div>
        )}

        {error && (
          <p
            className="mt-4 text-[12px]"
            style={{ color: 'var(--mzaya-error)' }}
          >
            {error}
          </p>
        )}

        <Button
          onClick={() =>
            onConfirmCancellation?.({
              order,
              reasonId: selectedReasonId,
              customReason,
            })
          }
          loading={cancelling}
          disabled={
            !selectedReasonId ||
            (requiresText && !customReason.trim()) ||
            !onConfirmCancellation
          }
          className="mt-6 w-full"
        >
          Confirm cancellation
        </Button>
      </main>
    </PageShell>
  )
}
