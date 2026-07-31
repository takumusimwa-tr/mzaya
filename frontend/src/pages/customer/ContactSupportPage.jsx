/**
 * ============================================================================
 * MZAYA
 * Page: ContactSupportPage
 * Path: frontend/src/pages/customer/ContactSupportPage.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Composes the customer support contact experience.
 *
 * Responsibilities
 * ----------------
 * • Display support channels supplied by the application layer.
 * • Display optional order context and issue category selection.
 * • Forward channel, category and support-request actions.
 * • Render loading, unavailable and error states.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not create support tickets.
 * • Does not send email, SMS, chat or phone requests.
 * • Does not fetch support availability.
 * • Does not navigate directly.
 *
 * Privacy
 * -------
 * Do not place payment credentials, passwords, PINs or identity documents in
 * support-message fields.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial page composition.
 * ============================================================================
 */

import {
  ArrowLeft,
  ChevronRight,
  Headphones,
  MessageCircle,
  Phone,
  Send,
} from 'lucide-react'
import PageShell from '../../components/layout/PageShell'
import Button from '../../components/ui/Button'

const CHANNEL_ICONS = {
  chat: MessageCircle,
  phone: Phone,
  default: Headphones,
}

export default function ContactSupportPage({
  order,
  categories = [],
  selectedCategoryId = null,
  message = '',
  channels = [],
  loading = false,
  error = null,
  submitting = false,
  onBack,
  onRetry,
  onCategoryChange,
  onMessageChange,
  onOpenChannel,
  onSubmit,
}) {
  return (
    <PageShell>
      <main
        className="mx-auto w-full max-w-3xl px-4 pb-12 pt-4 sm:px-6"
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
              Contact support
            </h1>
            <p
              className="mt-1 text-[12px]"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              Tell us what happened and we will guide you.
            </p>
          </div>
        </header>

        {loading ? (
          <div className="mt-6 space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-[22px] border"
                style={{
                  minHeight: 120,
                  borderColor: 'var(--mzaya-border)',
                  background: 'var(--mzaya-surface)',
                }}
                aria-hidden="true"
              />
            ))}
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
              Support is unavailable
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
          <>
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
                  Order context
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

            {categories.length > 0 && (
              <section className="mt-6" aria-labelledby="support-category-heading">
                <h2
                  id="support-category-heading"
                  className="text-[15px] font-semibold"
                  style={{ color: 'var(--mzaya-text-primary)' }}
                >
                  What do you need help with?
                </h2>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {categories.map((category) => {
                    const selected = selectedCategoryId === category.id
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => onCategoryChange?.(category)}
                        className="rounded-[17px] border px-4 py-3 text-left outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
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
                          className="text-[12px] font-medium"
                          style={{ color: 'var(--mzaya-text-primary)' }}
                        >
                          {category.label ?? category.name}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </section>
            )}

            <section
              className="mt-6 rounded-[22px] border bg-white p-5"
              style={{
                borderColor: 'var(--mzaya-border)',
                boxShadow: 'var(--mzaya-shadow-sm)',
              }}
            >
              <label
                htmlFor="support-message"
                className="text-[14px] font-semibold"
                style={{ color: 'var(--mzaya-text-primary)' }}
              >
                Describe the issue
              </label>

              <textarea
                id="support-message"
                value={message}
                rows={5}
                onChange={(event) => onMessageChange?.(event.target.value)}
                placeholder="Give us the important details..."
                className="mt-3 w-full resize-none rounded-[16px] border px-4 py-3 text-[13px] leading-6 outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                style={{
                  borderColor: 'var(--mzaya-border)',
                  color: 'var(--mzaya-text-primary)',
                }}
              />

              {onSubmit && (
                <Button
                  leadingIcon={Send}
                  loading={submitting}
                  onClick={() =>
                    onSubmit?.({
                      categoryId: selectedCategoryId,
                      message,
                      order,
                    })
                  }
                  className="mt-4 w-full"
                >
                  Send support request
                </Button>
              )}
            </section>

            {channels.length > 0 && (
              <section className="mt-6" aria-labelledby="support-channels-heading">
                <h2
                  id="support-channels-heading"
                  className="text-[15px] font-semibold"
                  style={{ color: 'var(--mzaya-text-primary)' }}
                >
                  Other ways to reach us
                </h2>

                <div
                  className="mt-3 overflow-hidden rounded-[20px] border bg-white"
                  style={{
                    borderColor: 'var(--mzaya-border)',
                    boxShadow: 'var(--mzaya-shadow-sm)',
                  }}
                >
                  {channels.map((channel, index) => {
                    const Icon = CHANNEL_ICONS[channel.type] ?? CHANNEL_ICONS.default
                    return (
                      <button
                        key={channel.id}
                        type="button"
                        onClick={() => onOpenChannel?.(channel)}
                        className={`flex w-full items-center gap-3 px-4 py-4 text-left outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)] ${
                          index ? 'border-t' : ''
                        }`}
                        style={{ borderColor: 'var(--mzaya-border)' }}
                      >
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-[13px]"
                          style={{
                            background: 'var(--mzaya-primary-soft)',
                            color: 'var(--mzaya-primary)',
                          }}
                        >
                          <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className="text-[13px] font-semibold"
                            style={{ color: 'var(--mzaya-text-primary)' }}
                          >
                            {channel.label ?? channel.name}
                          </p>
                          {channel.description && (
                            <p
                              className="mt-1 text-[11px]"
                              style={{ color: 'var(--mzaya-text-muted)' }}
                            >
                              {channel.description}
                            </p>
                          )}
                        </div>
                        <ChevronRight
                          size={18}
                          strokeWidth={1.8}
                          aria-hidden="true"
                          style={{ color: 'var(--mzaya-text-muted)' }}
                        />
                      </button>
                    )
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </PageShell>
  )
}
