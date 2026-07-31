/**
 * ============================================================================
 * MZAYA
 * Page: PaymentPage
 * Path: frontend/src/pages/customer/PaymentPage.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Composes payment-method selection and order-payment confirmation.
 *
 * Responsibilities
 * ----------------
 * • Display available payment methods and selected method.
 * • Surface secure payment guidance and order total.
 * • Forward selection, add-method and payment actions.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not collect raw card numbers, CVV, PIN or wallet credentials.
 * • Does not tokenize or process payments.
 * • Does not create orders.
 * • Does not interpret gateway responses.
 *
 * Security Contract
 * -----------------
 * This page must receive masked, display-safe payment data only. Sensitive input
 * belongs in the approved payment provider flow.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial page composition.
 * ============================================================================
 */

import { ArrowLeft, CreditCard, LockKeyhole, Plus } from 'lucide-react'
import PageShell from '../../components/layout/PageShell'
import Button from '../../components/ui/Button'
import SavedPaymentMethodCard from '../../components/profile/SavedPaymentMethodCard'

export default function PaymentPage({
  paymentMethods = [],
  selectedPaymentMethodId = null,
  orderTotal,
  loading = false,
  error = null,
  paying = false,
  onBack,
  onRetry,
  onSelectPaymentMethod,
  onAddPaymentMethod,
  onPay,
}) {
  return (
    <PageShell>
      <main
        className="mx-auto w-full max-w-4xl px-4 pb-28 pt-4 sm:px-6"
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
              Payment
            </h1>
            <p
              className="mt-1 text-[12px]"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              Choose a secure way to pay.
            </p>
          </div>
        </header>

        <section
          className="mt-6 rounded-[22px] border p-5"
          style={{
            borderColor: 'var(--mzaya-border)',
            background: 'var(--mzaya-primary-soft)',
          }}
        >
          <div className="flex gap-3">
            <LockKeyhole
              size={20}
              strokeWidth={1.8}
              aria-hidden="true"
              style={{ color: 'var(--mzaya-primary)' }}
            />
            <div>
              <h2
                className="text-[14px] font-semibold"
                style={{ color: 'var(--mzaya-text-primary)' }}
              >
                Secure payment
              </h2>
              <p
                className="mt-1 text-[12px] leading-5"
                style={{ color: 'var(--mzaya-text-secondary)' }}
              >
                Mzaya never displays full payment credentials. Payment
                authorization is completed through the approved provider.
              </p>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="mt-5 space-y-4">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-[22px] border"
                style={{
                  minHeight: 150,
                  borderColor: 'var(--mzaya-border)',
                  background: 'var(--mzaya-surface)',
                }}
                aria-hidden="true"
              />
            ))}
          </div>
        ) : error ? (
          <section
            className="mt-5 rounded-[24px] border bg-white px-6 py-12 text-center"
            style={{
              borderColor: 'var(--mzaya-border)',
              boxShadow: 'var(--mzaya-shadow-sm)',
            }}
          >
            <h2
              className="text-[20px] font-semibold"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              We could not load payment options
            </h2>
            <p
              className="mx-auto mt-2 max-w-[380px] text-[13px] leading-6"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              {error}
            </p>
            {onRetry && (
              <Button onClick={onRetry} className="mt-6">
                Try again
              </Button>
            )}
          </section>
        ) : (
          <section className="mt-5" aria-labelledby="payment-methods-heading">
            <div className="mb-3 flex items-center justify-between gap-4">
              <h2
                id="payment-methods-heading"
                className="text-[16px] font-semibold"
                style={{ color: 'var(--mzaya-text-primary)' }}
              >
                Payment methods
              </h2>

              {onAddPaymentMethod && (
                <Button
                  variant="outline"
                  leadingIcon={Plus}
                  onClick={onAddPaymentMethod}
                >
                  Add method
                </Button>
              )}
            </div>

            {paymentMethods.length ? (
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const id =
                    method.id ??
                    method.payment_method_id ??
                    method.paymentMethodId
                  const selected = selectedPaymentMethodId === id

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => onSelectPaymentMethod?.(method)}
                      className="block w-full rounded-[22px] text-left outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                      aria-pressed={selected}
                    >
                      <div
                        className="rounded-[22px]"
                        style={{
                          outline: selected
                            ? '2px solid var(--mzaya-primary)'
                            : '2px solid transparent',
                          outlineOffset: 2,
                        }}
                      >
                        <SavedPaymentMethodCard
                          method={method}
                          selectable
                          selected={selected}
                        />
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <section
                className="rounded-[22px] border bg-white px-6 py-12 text-center"
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
                  <CreditCard size={24} strokeWidth={1.8} aria-hidden="true" />
                </div>
                <h2
                  className="mt-5 text-[19px] font-semibold"
                  style={{ color: 'var(--mzaya-text-primary)' }}
                >
                  No payment method selected
                </h2>
                <p
                  className="mx-auto mt-2 max-w-[360px] text-[13px] leading-6"
                  style={{ color: 'var(--mzaya-text-muted)' }}
                >
                  Add a secure payment method to complete this order.
                </p>
              </section>
            )}
          </section>
        )}

        {!loading && !error && (
          <div className="fixed inset-x-0 bottom-4 z-20 px-4">
            <div className="mx-auto max-w-xl">
              <Button
                onClick={onPay}
                loading={paying}
                disabled={!selectedPaymentMethodId || !onPay}
                className="w-full justify-between"
              >
                <span>Pay securely</span>
                {orderTotal && <span>{orderTotal}</span>}
              </Button>
            </div>
          </div>
        )}
      </main>
    </PageShell>
  )
}
