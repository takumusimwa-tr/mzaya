/**
 * ============================================================================
 * MZAYA
 * Page: PaymentStatusPage
 * Path: frontend/src/pages/customer/PaymentStatusPage.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Presents the confirmed result of a payment attempt.
 *
 * Responsibilities
 * ----------------
 * • Display success, pending or failed payment states.
 * • Surface safe reference information and next actions.
 * • Forward retry, order and support actions.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not poll gateway status.
 * • Does not infer payment state.
 * • Does not retry payments automatically.
 * • Does not display sensitive gateway payloads.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial page composition.
 * ============================================================================
 */

import {
  CheckCircle2,
  Clock3,
  ReceiptText,
  TriangleAlert,
} from 'lucide-react'
import PageShell from '../../components/layout/PageShell'
import Button from '../../components/ui/Button'

const STATUS_CONTENT = {
  success: {
    icon: CheckCircle2,
    title: 'Payment successful',
    description:
      'Your payment was confirmed and your Mzaya order is being prepared.',
    tone: 'var(--mzaya-success)',
  },
  pending: {
    icon: Clock3,
    title: 'Payment pending',
    description:
      'The provider is still confirming your payment. Do not pay again unless prompted.',
    tone: 'var(--mzaya-warning)',
  },
  failed: {
    icon: TriangleAlert,
    title: 'Payment unsuccessful',
    description:
      'The payment could not be completed. Your order has not been confirmed.',
    tone: 'var(--mzaya-error)',
  },
}

export default function PaymentStatusPage({
  status = 'pending',
  reference,
  orderReference,
  message,
  onViewOrder,
  onRetryPayment,
  onContactSupport,
}) {
  const content = STATUS_CONTENT[status] ?? STATUS_CONTENT.pending
  const Icon = content.icon

  return (
    <PageShell>
      <main className="mx-auto flex min-h-[75vh] w-full max-w-2xl items-center px-4 py-10 sm:px-6">
        <section
          className="w-full rounded-[28px] border bg-white p-6 text-center sm:p-8"
          style={{
            borderColor: 'var(--mzaya-border)',
            boxShadow: 'var(--mzaya-shadow-md)',
          }}
          aria-live="polite"
        >
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px]"
            style={{
              background: 'var(--mzaya-surface-muted)',
              color: content.tone,
            }}
          >
            <Icon size={29} strokeWidth={1.8} aria-hidden="true" />
          </div>

          <h1
            className="mt-6 text-[28px] font-semibold tracking-[-0.04em]"
            style={{ color: 'var(--mzaya-text-primary)' }}
          >
            {content.title}
          </h1>

          <p
            className="mx-auto mt-3 max-w-[480px] text-[13px] leading-6"
            style={{ color: 'var(--mzaya-text-secondary)' }}
          >
            {message ?? content.description}
          </p>

          {(reference || orderReference) && (
            <dl
              className="mx-auto mt-6 max-w-md rounded-[18px] border p-4 text-left"
              style={{
                borderColor: 'var(--mzaya-border)',
                background: 'var(--mzaya-surface)',
              }}
            >
              {orderReference && (
                <div className="flex items-center justify-between gap-4">
                  <dt
                    className="text-[11px]"
                    style={{ color: 'var(--mzaya-text-muted)' }}
                  >
                    Order reference
                  </dt>
                  <dd
                    className="text-[12px] font-semibold"
                    style={{ color: 'var(--mzaya-text-primary)' }}
                  >
                    {orderReference}
                  </dd>
                </div>
              )}

              {reference && (
                <div
                  className={`flex items-center justify-between gap-4 ${
                    orderReference ? 'mt-3' : ''
                  }`}
                >
                  <dt
                    className="text-[11px]"
                    style={{ color: 'var(--mzaya-text-muted)' }}
                  >
                    Payment reference
                  </dt>
                  <dd
                    className="text-[12px] font-semibold"
                    style={{ color: 'var(--mzaya-text-primary)' }}
                  >
                    {reference}
                  </dd>
                </div>
              )}
            </dl>
          )}

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {status === 'success' && onViewOrder && (
              <Button
                leadingIcon={ReceiptText}
                onClick={onViewOrder}
                className="w-full"
              >
                View order
              </Button>
            )}

            {status === 'failed' && onRetryPayment && (
              <Button onClick={onRetryPayment} className="w-full">
                Try another payment
              </Button>
            )}

            {onContactSupport && (
              <Button
                variant="outline"
                onClick={onContactSupport}
                className="w-full"
              >
                Contact support
              </Button>
            )}
          </div>

          {status === 'pending' && (
            <p
              className="mt-6 text-[11px] leading-5"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              You may leave this screen. The connected application should keep
              the order status synchronized with the backend.
            </p>
          )}
        </section>
      </main>
    </PageShell>
  )
}
