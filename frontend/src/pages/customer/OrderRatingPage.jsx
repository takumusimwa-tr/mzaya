/**
 * ============================================================================
 * MZAYA
 * Page: OrderRatingPage
 * Path: frontend/src/pages/customer/OrderRatingPage.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Composes a customer order-rating and feedback experience.
 *
 * Responsibilities
 * ----------------
 * • Display order context and controlled rating state.
 * • Collect optional customer feedback.
 * • Forward rating and submission actions.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not persist ratings.
 * • Does not moderate or publish feedback.
 * • Does not calculate rider or merchant scores.
 * • Does not navigate directly.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial page composition.
 * ============================================================================
 */

import { ArrowLeft, Star } from 'lucide-react'
import PageShell from '../../components/layout/PageShell'
import Button from '../../components/ui/Button'

export default function OrderRatingPage({
  order,
  rating = 0,
  feedback = '',
  submitting = false,
  submitted = false,
  error = null,
  onBack,
  onRatingChange,
  onFeedbackChange,
  onSubmit,
}) {
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
              Rate your order
            </h1>
            <p
              className="mt-1 text-[12px]"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              Your feedback helps Mzaya improve.
            </p>
          </div>
        </header>

        <section
          className="mt-6 rounded-[26px] border bg-white p-6 text-center sm:p-8"
          style={{
            borderColor: 'var(--mzaya-border)',
            boxShadow: 'var(--mzaya-shadow-md)',
          }}
        >
          {submitted ? (
            <>
              <div
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px]"
                style={{
                  background: 'var(--mzaya-primary-soft)',
                  color: 'var(--mzaya-primary)',
                }}
              >
                <Star size={28} fill="currentColor" strokeWidth={1.6} />
              </div>
              <h2
                className="mt-6 text-[24px] font-semibold"
                style={{ color: 'var(--mzaya-text-primary)' }}
              >
                Thank you
              </h2>
              <p
                className="mx-auto mt-2 max-w-sm text-[13px] leading-6"
                style={{ color: 'var(--mzaya-text-muted)' }}
              >
                Your feedback was received.
              </p>
            </>
          ) : (
            <>
              {order && (
                <>
                  <p
                    className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: 'var(--mzaya-primary)' }}
                  >
                    {order.merchant_name ??
                      order.merchantName ??
                      'Mzaya order'}
                  </p>
                  <p
                    className="mt-1 text-[11px]"
                    style={{ color: 'var(--mzaya-text-muted)' }}
                  >
                    {order.reference ??
                      order.order_reference ??
                      order.orderReference}
                  </p>
                </>
              )}

              <h2
                className="mt-5 text-[22px] font-semibold"
                style={{ color: 'var(--mzaya-text-primary)' }}
              >
                How was your experience?
              </h2>

              <div
                className="mt-5 flex justify-center gap-2"
                role="radiogroup"
                aria-label="Order rating"
              >
                {[1, 2, 3, 4, 5].map((value) => {
                  const active = value <= rating
                  return (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={rating === value}
                      onClick={() => onRatingChange?.(value)}
                      className="flex h-11 w-11 items-center justify-center rounded-[14px] outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                      aria-label={`${value} star${value === 1 ? '' : 's'}`}
                    >
                      <Star
                        size={25}
                        strokeWidth={1.6}
                        fill={active ? 'currentColor' : 'none'}
                        style={{
                          color: active
                            ? 'var(--mzaya-warning)'
                            : 'var(--mzaya-border-strong)',
                        }}
                      />
                    </button>
                  )
                })}
              </div>

              <label
                htmlFor="order-feedback"
                className="mt-6 block text-left text-[13px] font-semibold"
                style={{ color: 'var(--mzaya-text-primary)' }}
              >
                Tell us more
                <span
                  className="ml-2 font-normal"
                  style={{ color: 'var(--mzaya-text-muted)' }}
                >
                  Optional
                </span>
              </label>

              <textarea
                id="order-feedback"
                rows={5}
                value={feedback}
                onChange={(event) => onFeedbackChange?.(event.target.value)}
                placeholder="What went well, or what could be better?"
                className="mt-2 w-full resize-none rounded-[16px] border px-4 py-3 text-left text-[13px] leading-6 outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                style={{
                  borderColor: 'var(--mzaya-border)',
                  color: 'var(--mzaya-text-primary)',
                }}
              />

              {error && (
                <p
                  className="mt-3 text-left text-[12px]"
                  style={{ color: 'var(--mzaya-error)' }}
                >
                  {error}
                </p>
              )}

              <Button
                onClick={() => onSubmit?.({ order, rating, feedback })}
                loading={submitting}
                disabled={!rating || !onSubmit}
                className="mt-5 w-full"
              >
                Submit rating
              </Button>
            </>
          )}
        </section>
      </main>
    </PageShell>
  )
}
