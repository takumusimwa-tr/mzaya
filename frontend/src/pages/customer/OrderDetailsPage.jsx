/**
 * ============================================================================
 * MZAYA
 * Page: OrderDetailsPage
 * Path: frontend/src/pages/customer/OrderDetailsPage.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Composes the customer's read-only order receipt and historical order detail
 * experience from the canonical Mzaya order components.
 *
 * Responsibilities
 * ----------------
 * • Display order reference, merchant, status, address and ordered items.
 * • Present payment and pricing summary information.
 * • Expose receipt, reorder and support actions supplied by the parent.
 * • Render loading, error and unavailable-order states.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not fetch order data.
 * • Does not calculate authoritative totals.
 * • Does not initiate refunds, reorders or receipt downloads.
 * • Does not normalize backend payment or order statuses.
 * • Does not navigate directly.
 *
 * Canonical Component Policy
 * --------------------------
 * This page uses the canonical shared components under:
 *
 *   frontend/src/components/orders/
 *   frontend/src/components/cart/
 *
 * Remove older page-local receipt rows, item lists, status badges, address
 * summaries and order headers once their imports have been migrated.
 *
 * Integration Contract
 * --------------------
 * The connected container should:
 * 1. Fetch and normalize one customer order.
 * 2. Supply backend-authoritative pricing values.
 * 3. Format date labels for the current locale.
 * 4. Handle copy, receipt, reorder, support, retry and back actions.
 *
 * Props
 * -----
 * order?: {
 *   reference?: string,
 *   merchant_name?: string,
 *   placed_at_label?: string,
 *   status?: string,
 *   status_label?: string,
 *   delivery_address?: Object,
 *   items?: Array,
 *   subtotal_usd?: number,
 *   delivery_fee_usd?: number,
 *   service_fee_usd?: number,
 *   discount_usd?: number,
 *   total_usd?: number,
 *   payment_method_label?: string,
 *   payment_status_label?: string,
 *   delivery_instructions?: string
 * }
 * loading?: boolean
 * error?: string | null
 * onBack?: () => void
 * onRetry?: () => void
 * onCopyReference?: (reference: string) => void
 * onViewReceipt?: (order: Object) => void
 * onReorder?: (order: Object) => void
 * onSupport?: (order: Object) => void
 *
 * Dependencies
 * ------------
 * • AppHeader.jsx
 * • PageShell.jsx
 * • Button.jsx
 * • Money.jsx
 * • OrderReferenceCard.jsx
 * • OrderStatusBadge.jsx
 * • DeliveryAddressSummary.jsx
 * • OrderItemsSummary.jsx
 * • OrderHelpCard.jsx
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial page composition.
 * ============================================================================
 */

import { CreditCard, FileText, RotateCcw } from 'lucide-react'
import AppHeader from '../../components/layout/AppHeader'
import PageShell from '../../components/layout/PageShell'
import Button from '../../components/ui/Button'
import Money from '../../components/ui/Money'
import DeliveryAddressSummary from '../../components/orders/DeliveryAddressSummary'
import OrderHelpCard from '../../components/orders/OrderHelpCard'
import OrderItemsSummary from '../../components/orders/OrderItemsSummary'
import OrderReferenceCard from '../../components/orders/OrderReferenceCard'
import OrderStatusBadge from '../../components/orders/OrderStatusBadge'

function SummaryRow({ label, amount, emphasized = false, negative = false }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span
        className={emphasized ? 'text-[14px] font-semibold' : 'text-[13px]'}
        style={{
          color: emphasized
            ? 'var(--mzaya-text-primary)'
            : 'var(--mzaya-text-secondary)',
        }}
      >
        {label}
      </span>

      <Money
        usd={negative ? -Math.abs(Number(amount || 0)) : Number(amount || 0)}
        size={emphasized ? 'base' : 'sm'}
      />
    </div>
  )
}

function OrderDetailsSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.75fr)]">
      <div className="space-y-4">
        {[180, 260, 170].map((height, index) => (
          <div
            key={`${height}-${index}`}
            className="animate-pulse rounded-[22px] border bg-white p-5"
            style={{
              minHeight: height,
              borderColor: 'var(--mzaya-border)',
              boxShadow: 'var(--mzaya-shadow-sm)',
            }}
            aria-hidden="true"
          >
            <div
              className="h-4 w-36 rounded-full"
              style={{ background: 'var(--mzaya-surface-muted)' }}
            />
            <div
              className="mt-3 h-3 w-52 rounded-full"
              style={{ background: 'var(--mzaya-surface-muted)' }}
            />
          </div>
        ))}
      </div>

      <div
        className="animate-pulse rounded-[22px] border bg-white p-5"
        style={{
          minHeight: 300,
          borderColor: 'var(--mzaya-border)',
          boxShadow: 'var(--mzaya-shadow-sm)',
        }}
        aria-hidden="true"
      >
        <div
          className="h-4 w-32 rounded-full"
          style={{ background: 'var(--mzaya-surface-muted)' }}
        />
        <div
          className="mt-5 h-3 w-full rounded-full"
          style={{ background: 'var(--mzaya-surface-muted)' }}
        />
        <div
          className="mt-3 h-3 w-4/5 rounded-full"
          style={{ background: 'var(--mzaya-surface-muted)' }}
        />
      </div>
    </div>
  )
}

export default function OrderDetailsPage({
  order,
  loading = false,
  error = null,
  onBack,
  onRetry,
  onCopyReference,
  onViewReceipt,
  onReorder,
  onSupport,
}) {
  const reference = order?.reference ?? order?.order_reference
  const merchantName = order?.merchant_name ?? order?.merchant?.name
  const placedAt = order?.placed_at_label ?? order?.created_at_label
  const address = order?.delivery_address ?? order?.deliveryAddress
  const items = order?.items ?? order?.order_items ?? []

  const subtotal = Number(order?.subtotal_usd ?? order?.subtotal ?? 0)
  const deliveryFee = Number(
    order?.delivery_fee_usd ?? order?.delivery_fee ?? 0
  )
  const serviceFee = Number(order?.service_fee_usd ?? order?.service_fee ?? 0)
  const discount = Number(order?.discount_usd ?? order?.discount ?? 0)
  const total = Number(order?.total_usd ?? order?.total ?? 0)

  return (
    <PageShell>
      <AppHeader
        title="Order details"
        subtitle={merchantName ? `Order from ${merchantName}` : undefined}
        onBack={onBack}
      />

      <main
        className="mx-auto w-full max-w-5xl px-4 pb-12 pt-4 sm:px-6"
        aria-live="polite"
      >
        {loading ? (
          <OrderDetailsSkeleton />
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
              We could not load this order
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
        ) : !order ? (
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
              Order unavailable
            </h1>

            <p
              className="mx-auto mt-2 max-w-[360px] text-[13px] leading-6"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              This order could not be found or is no longer available.
            </p>
          </section>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.75fr)]">
            <div className="space-y-4">
              <OrderReferenceCard
                reference={reference}
                merchantName={merchantName}
                placedAt={placedAt}
                onCopy={
                  reference && onCopyReference
                    ? () => onCopyReference(reference)
                    : undefined
                }
              />

              <section
                className="rounded-[22px] border bg-white p-5"
                style={{
                  borderColor: 'var(--mzaya-border)',
                  boxShadow: 'var(--mzaya-shadow-sm)',
                }}
                aria-labelledby="order-status-heading"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2
                      id="order-status-heading"
                      className="text-[14px] font-semibold"
                      style={{ color: 'var(--mzaya-text-primary)' }}
                    >
                      Order status
                    </h2>

                    {order.status_message && (
                      <p
                        className="mt-1 text-[12px] leading-5"
                        style={{ color: 'var(--mzaya-text-muted)' }}
                      >
                        {order.status_message}
                      </p>
                    )}
                  </div>

                  <OrderStatusBadge
                    status={order.status}
                    label={order.status_label}
                  />
                </div>
              </section>

              <OrderItemsSummary items={items} title="Order items" />

              <DeliveryAddressSummary address={address} />

              {order.delivery_instructions && (
                <section
                  className="rounded-[22px] border bg-white p-5"
                  style={{
                    borderColor: 'var(--mzaya-border)',
                    boxShadow: 'var(--mzaya-shadow-sm)',
                  }}
                  aria-labelledby="delivery-instructions-heading"
                >
                  <h2
                    id="delivery-instructions-heading"
                    className="text-[14px] font-semibold"
                    style={{ color: 'var(--mzaya-text-primary)' }}
                  >
                    Delivery instructions
                  </h2>

                  <p
                    className="mt-2 text-[13px] leading-6"
                    style={{ color: 'var(--mzaya-text-secondary)' }}
                  >
                    {order.delivery_instructions}
                  </p>
                </section>
              )}
            </div>

            <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
              <section
                className="rounded-[22px] border bg-white p-5"
                style={{
                  borderColor: 'var(--mzaya-border)',
                  boxShadow: 'var(--mzaya-shadow-sm)',
                }}
                aria-labelledby="order-payment-summary-heading"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-[14px]"
                    style={{
                      background: 'var(--mzaya-surface-muted)',
                      color: 'var(--mzaya-text-secondary)',
                    }}
                  >
                    <CreditCard aria-hidden="true" size={18} strokeWidth={1.8} />
                  </div>

                  <div>
                    <h2
                      id="order-payment-summary-heading"
                      className="text-[15px] font-semibold"
                      style={{ color: 'var(--mzaya-text-primary)' }}
                    >
                      Payment summary
                    </h2>

                    {(order.payment_method_label ||
                      order.payment_status_label) && (
                      <p
                        className="mt-1 text-[11px]"
                        style={{ color: 'var(--mzaya-text-muted)' }}
                      >
                        {[order.payment_method_label, order.payment_status_label]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    )}
                  </div>
                </div>

                <div
                  className="mt-4 border-t pt-3"
                  style={{ borderColor: 'var(--mzaya-border)' }}
                >
                  <SummaryRow label="Subtotal" amount={subtotal} />

                  {deliveryFee !== 0 && (
                    <SummaryRow label="Delivery fee" amount={deliveryFee} />
                  )}

                  {serviceFee !== 0 && (
                    <SummaryRow label="Service fee" amount={serviceFee} />
                  )}

                  {discount !== 0 && (
                    <SummaryRow
                      label="Discount"
                      amount={discount}
                      negative
                    />
                  )}

                  <div
                    className="mt-2 border-t pt-2"
                    style={{ borderColor: 'var(--mzaya-border)' }}
                  >
                    <SummaryRow label="Total" amount={total} emphasized />
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {onViewReceipt && (
                    <Button
                      variant="outline"
                      leadingIcon={FileText}
                      onClick={() => onViewReceipt(order)}
                      className="w-full"
                    >
                      View receipt
                    </Button>
                  )}

                  {onReorder && (
                    <Button
                      leadingIcon={RotateCcw}
                      onClick={() => onReorder(order)}
                      className="w-full"
                    >
                      Order again
                    </Button>
                  )}
                </div>
              </section>

              <OrderHelpCard
                onDeliveryIssue={
                  onSupport ? () => onSupport(order, 'delivery') : undefined
                }
                onPaymentIssue={
                  onSupport ? () => onSupport(order, 'payment') : undefined
                }
                onItemIssue={
                  onSupport ? () => onSupport(order, 'items') : undefined
                }
                onSupport={
                  onSupport ? () => onSupport(order, 'general') : undefined
                }
              />
            </aside>
          </div>
        )}
      </main>
    </PageShell>
  )
}
