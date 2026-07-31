/**
 * ============================================================================
 * MZAYA
 * Page: CheckoutPage
 * Path: frontend/src/pages/customer/CheckoutPage.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Composes the final order-review experience before payment.
 *
 * Responsibilities
 * ----------------
 * • Display selected delivery address, fulfilment details and order summary.
 * • Display parent-controlled delivery instructions and scheduling options.
 * • Forward edits and continue-to-payment action.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not calculate totals, fees, ETA or serviceability.
 * • Does not create orders.
 * • Does not persist checkout state.
 * • Does not navigate directly.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial page composition.
 * ============================================================================
 */

import { ArrowLeft, ChevronRight, Clock3, MapPin, NoteText } from 'lucide-react'
import PageShell from '../../components/layout/PageShell'
import Button from '../../components/ui/Button'

export default function CheckoutPage({
  checkout,
  deliveryAddress,
  deliveryWindow,
  deliveryInstructions = '',
  loading = false,
  error = null,
  continuing = false,
  onBack,
  onRetry,
  onChangeAddress,
  onChangeDeliveryWindow,
  onInstructionsChange,
  onContinueToPayment,
}) {
  return (
    <PageShell>
      <main
        className="mx-auto w-full max-w-5xl px-4 pb-28 pt-4 sm:px-6"
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
              Checkout
            </h1>
            <p
              className="mt-1 text-[12px]"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              Confirm delivery details before payment.
            </p>
          </div>
        </header>

        {loading ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_340px]">
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
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
            <div
              className="animate-pulse rounded-[22px] border"
              style={{
                minHeight: 320,
                borderColor: 'var(--mzaya-border)',
                background: 'var(--mzaya-surface)',
              }}
              aria-hidden="true"
            />
          </div>
        ) : error ? (
          <section
            className="mt-6 rounded-[24px] border bg-white px-6 py-12 text-center"
            style={{
              borderColor: 'var(--mzaya-border)',
              boxShadow: 'var(--mzaya-shadow-sm)',
            }}
          >
            <h2
              className="text-[20px] font-semibold"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              We could not load checkout
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
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_340px]">
            <div className="space-y-4">
              <section
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
                    <MapPin size={18} strokeWidth={1.8} aria-hidden="true" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <h2
                        className="text-[14px] font-semibold"
                        style={{ color: 'var(--mzaya-text-primary)' }}
                      >
                        Delivery address
                      </h2>
                      {onChangeAddress && (
                        <button
                          type="button"
                          onClick={onChangeAddress}
                          className="text-[12px] font-semibold outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                          style={{ color: 'var(--mzaya-primary)' }}
                        >
                          Change
                        </button>
                      )}
                    </div>

                    {deliveryAddress ? (
                      <div className="mt-3">
                        <p
                          className="text-[13px] font-medium"
                          style={{ color: 'var(--mzaya-text-primary)' }}
                        >
                          {deliveryAddress.label ?? 'Delivery address'}
                        </p>
                        <p
                          className="mt-1 text-[12px] leading-5"
                          style={{ color: 'var(--mzaya-text-muted)' }}
                        >
                          {deliveryAddress.formatted_address ??
                            deliveryAddress.formattedAddress ??
                            deliveryAddress.address}
                        </p>
                      </div>
                    ) : (
                      <p
                        className="mt-3 text-[12px]"
                        style={{ color: 'var(--mzaya-error)' }}
                      >
                        Select a delivery address to continue.
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <button
                type="button"
                onClick={onChangeDeliveryWindow}
                className="flex w-full items-center gap-3 rounded-[22px] border bg-white p-5 text-left outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                style={{
                  borderColor: 'var(--mzaya-border)',
                  boxShadow: 'var(--mzaya-shadow-sm)',
                }}
              >
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[14px]"
                  style={{
                    background: 'var(--mzaya-primary-soft)',
                    color: 'var(--mzaya-primary)',
                  }}
                >
                  <Clock3 size={18} strokeWidth={1.8} aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h2
                    className="text-[14px] font-semibold"
                    style={{ color: 'var(--mzaya-text-primary)' }}
                  >
                    Delivery time
                  </h2>
                  <p
                    className="mt-1 text-[12px]"
                    style={{ color: 'var(--mzaya-text-muted)' }}
                  >
                    {deliveryWindow?.label ??
                      deliveryWindow?.name ??
                      checkout?.delivery_eta ??
                      'Select a delivery window'}
                  </p>
                </div>
                <ChevronRight
                  size={18}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  style={{ color: 'var(--mzaya-text-muted)' }}
                />
              </button>

              <section
                className="rounded-[22px] border bg-white p-5"
                style={{
                  borderColor: 'var(--mzaya-border)',
                  boxShadow: 'var(--mzaya-shadow-sm)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-[14px]"
                    style={{
                      background: 'var(--mzaya-primary-soft)',
                      color: 'var(--mzaya-primary)',
                    }}
                  >
                    <NoteText size={18} strokeWidth={1.8} aria-hidden="true" />
                  </div>
                  <h2
                    className="text-[14px] font-semibold"
                    style={{ color: 'var(--mzaya-text-primary)' }}
                  >
                    Delivery instructions
                  </h2>
                </div>

                <textarea
                  value={deliveryInstructions}
                  onChange={(event) =>
                    onInstructionsChange?.(event.target.value)
                  }
                  rows={4}
                  placeholder="Gate, landmark or access notes for your mzaya..."
                  className="mt-4 w-full resize-none rounded-[16px] border px-4 py-3 text-[13px] leading-6 outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                  style={{
                    borderColor: 'var(--mzaya-border)',
                    color: 'var(--mzaya-text-primary)',
                  }}
                />
              </section>
            </div>

            <aside
              className="h-fit rounded-[22px] border bg-white p-5"
              style={{
                borderColor: 'var(--mzaya-border)',
                boxShadow: 'var(--mzaya-shadow-sm)',
              }}
            >
              <h2
                className="text-[15px] font-semibold"
                style={{ color: 'var(--mzaya-text-primary)' }}
              >
                Order summary
              </h2>

              <dl className="mt-5 space-y-3">
                {(checkout?.summary_rows ?? checkout?.summaryRows ?? []).map(
                  (row) => (
                    <div
                      key={row.id ?? row.label}
                      className="flex items-center justify-between gap-4"
                    >
                      <dt
                        className="text-[12px]"
                        style={{ color: 'var(--mzaya-text-muted)' }}
                      >
                        {row.label}
                      </dt>
                      <dd
                        className="text-[12px] font-medium"
                        style={{ color: 'var(--mzaya-text-primary)' }}
                      >
                        {row.value}
                      </dd>
                    </div>
                  )
                )}

                <div
                  className="flex items-center justify-between gap-4 border-t pt-4"
                  style={{ borderColor: 'var(--mzaya-border)' }}
                >
                  <dt
                    className="text-[14px] font-semibold"
                    style={{ color: 'var(--mzaya-text-primary)' }}
                  >
                    Total
                  </dt>
                  <dd
                    className="text-[16px] font-semibold"
                    style={{ color: 'var(--mzaya-primary)' }}
                  >
                    {checkout?.formatted_total ??
                      checkout?.formattedTotal ??
                      checkout?.total}
                  </dd>
                </div>
              </dl>

              <Button
                onClick={onContinueToPayment}
                loading={continuing}
                disabled={!deliveryAddress || !onContinueToPayment}
                className="mt-6 w-full"
              >
                Continue to payment
              </Button>
            </aside>
          </div>
        )}
      </main>
    </PageShell>
  )
}
