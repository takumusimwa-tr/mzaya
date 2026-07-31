/**
 * ============================================================================
 * MZAYA
 * Page: OrderTrackingPage
 * Path: frontend/src/pages/customer/OrderTrackingPage.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Composes the complete live-delivery experience from the canonical reusable
 * order components.
 *
 * Responsibilities
 * ----------------
 * • Display order reference, ETA, map, timeline and courier information.
 * • Display the confirmed delivery address and ordered items.
 * • Surface support entry points and page-level loading/error states.
 * • Forward all actions to the connected application layer.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not fetch, poll or subscribe to order updates.
 * • Does not initialize a map provider.
 * • Does not calculate ETA, route distance or courier position.
 * • Does not initiate phone calls, messages or support cases.
 * • Does not normalize backend order or tracking payloads.
 *
 * Canonical Component Policy
 * --------------------------
 * This page intentionally composes the canonical files under:
 *
 *   frontend/src/components/orders/
 *
 * Any older page-local copies of timeline, courier, ETA, address, item-summary
 * or support UI should be removed after the connected page has migrated to this
 * composition. Do not maintain duplicate implementations in legacy folders.
 *
 * Integration Contract
 * --------------------
 * The connected container should:
 * 1. Fetch or subscribe to normalized live order data.
 * 2. Supply a map instance through mapContent.
 * 3. Format date and time labels before passing them to this page.
 * 4. Handle copy, call, message, support, retry and back actions.
 *
 * Props
 * -----
 * order?: {
 *   reference?: string,
 *   merchant_name?: string,
 *   placed_at_label?: string,
 *   eta?: string,
 *   eta_message?: string,
 *   delayed?: boolean,
 *   delay_message?: string,
 *   timeline?: Array,
 *   courier?: Object | null,
 *   delivery_address?: Object,
 *   items?: Array
 * }
 * loading?: boolean
 * error?: string | null
 * mapContent?: ReactNode
 * mapLoading?: boolean
 * mapUnavailable?: boolean
 * onBack?: () => void
 * onRetry?: () => void
 * onCopyReference?: (reference: string) => void
 * onRecenterMap?: () => void
 * onCallCourier?: (courier: Object) => void
 * onMessageCourier?: (courier: Object) => void
 * onSupport?: (topic?: string) => void
 *
 * Dependencies
 * ------------
 * • AppHeader.jsx
 * • PageShell.jsx
 * • OrderReferenceCard.jsx
 * • DeliveryEtaCard.jsx
 * • TrackingMapPanel.jsx
 * • OrderStatusTimeline.jsx
 * • CourierCard.jsx
 * • DeliveryAddressSummary.jsx
 * • OrderItemsSummary.jsx
 * • OrderHelpCard.jsx
 * • Button.jsx
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial page composition.
 * ============================================================================
 */

import AppHeader from '../../components/layout/AppHeader'
import PageShell from '../../components/layout/PageShell'
import Button from '../../components/ui/Button'
import CourierCard from '../../components/orders/CourierCard'
import DeliveryAddressSummary from '../../components/orders/DeliveryAddressSummary'
import DeliveryEtaCard from '../../components/orders/DeliveryEtaCard'
import OrderHelpCard from '../../components/orders/OrderHelpCard'
import OrderItemsSummary from '../../components/orders/OrderItemsSummary'
import OrderReferenceCard from '../../components/orders/OrderReferenceCard'
import OrderStatusTimeline from '../../components/orders/OrderStatusTimeline'
import TrackingMapPanel from '../../components/orders/TrackingMapPanel'

function TrackingSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading order tracking">
      {[180, 130, 280, 260].map((height, index) => (
        <div
          key={`${height}-${index}`}
          className="animate-pulse rounded-[22px] border bg-white"
          style={{
            minHeight: height,
            borderColor: 'var(--mzaya-border)',
            background: 'var(--mzaya-surface)',
            boxShadow: 'var(--mzaya-shadow-sm)',
          }}
          aria-hidden="true"
        >
          <div className="p-5">
            <div
              className="h-4 w-32 rounded-full"
              style={{ background: 'var(--mzaya-surface-muted)' }}
            />
            <div
              className="mt-3 h-3 w-52 rounded-full"
              style={{ background: 'var(--mzaya-surface-muted)' }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function OrderTrackingPage({
  order,
  loading = false,
  error = null,
  mapContent,
  mapLoading = false,
  mapUnavailable = false,
  onBack,
  onRetry,
  onCopyReference,
  onRecenterMap,
  onCallCourier,
  onMessageCourier,
  onSupport,
}) {
  const reference = order?.reference ?? order?.order_reference
  const merchantName = order?.merchant_name ?? order?.merchant?.name
  const placedAt = order?.placed_at_label ?? order?.created_at_label
  const address = order?.delivery_address ?? order?.deliveryAddress
  const timeline = order?.timeline ?? order?.tracking_steps ?? []
  const courier = order?.courier ?? order?.rider ?? null
  const items = order?.items ?? order?.order_items ?? []

  return (
    <PageShell>
      <AppHeader
        title="Track order"
        subtitle={merchantName ? `Delivery from ${merchantName}` : undefined}
        onBack={onBack}
      />

      <main
        className="mx-auto w-full max-w-5xl px-4 pb-12 pt-4 sm:px-6"
        aria-live="polite"
      >
        {loading ? (
          <TrackingSkeleton />
        ) : error ? (
          <section
            className="rounded-[24px] border bg-white px-6 py-12 text-center"
            style={{
              borderColor: 'var(--mzaya-border)',
              boxShadow: 'var(--mzaya-shadow-sm)',
            }}
          >
            <h1
              className="text-[20px] font-semibold tracking-[-0.025em]"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              We could not load tracking
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
              This order could not be found or is no longer available for live
              tracking.
            </p>
          </section>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.8fr)]">
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

              <DeliveryEtaCard
                eta={order.eta ?? order.eta_label}
                message={order.eta_message ?? order.status_message}
                delayed={Boolean(order.delayed ?? order.is_delayed)}
                delayMessage={order.delay_message}
              />

              <TrackingMapPanel
                loading={mapLoading}
                unavailable={mapUnavailable}
                onRecenter={onRecenterMap}
              >
                {mapContent}
              </TrackingMapPanel>

              <OrderStatusTimeline steps={timeline} />

              <DeliveryAddressSummary address={address} />

              {items.length > 0 && <OrderItemsSummary items={items} />}
            </div>

            <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
              <CourierCard
                courier={courier}
                onCall={
                  courier && onCallCourier
                    ? () => onCallCourier(courier)
                    : undefined
                }
                onMessage={
                  courier && onMessageCourier
                    ? () => onMessageCourier(courier)
                    : undefined
                }
              />

              <OrderHelpCard
                onDeliveryIssue={
                  onSupport ? () => onSupport('delivery') : undefined
                }
                onPaymentIssue={
                  onSupport ? () => onSupport('payment') : undefined
                }
                onItemIssue={
                  onSupport ? () => onSupport('items') : undefined
                }
                onSupport={
                  onSupport ? () => onSupport('general') : undefined
                }
              />
            </aside>
          </div>
        )}
      </main>
    </PageShell>
  )
}
