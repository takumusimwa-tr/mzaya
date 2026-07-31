/**
 * ============================================================================
 * MZAYA
 * Component: TrackingMapPanel
 * Path: frontend/src/components/orders/TrackingMapPanel.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Provides the visual container used by the live-order page for courier and
 * delivery-location mapping.
 *
 * Responsibilities
 * ----------------
 * • Reserve a stable map area while the map provider loads.
 * • Render map content supplied through children.
 * • Display a clear loading or unavailable state.
 * • Support an optional recenter action.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not initialize Google Maps, Mapbox or another map SDK.
 * • Does not request browser location permissions.
 * • Does not calculate routes, distance or ETA.
 * • Does not poll courier coordinates.
 *
 * Integration Contract
 * --------------------
 * The parent page or map adapter should provide the actual map instance through
 * children. This keeps provider-specific code outside the shared UI layer.
 *
 * Dependencies
 * ------------
 * • Button.jsx
 * • lucide-react
 *
 * Used By
 * -------
 * • OrderTrackingPage.jsx
 *
 * Privacy Note
 * ------------
 * Only expose the minimum location precision required for active delivery.
 * Historical courier coordinates should not be retained in this component.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

import { LocateFixed, MapPin, Navigation } from 'lucide-react'
import Button from '../ui/Button'

export default function TrackingMapPanel({
  children,
  loading = false,
  unavailable = false,
  onRecenter,
  height = 280,
  className = '',
}) {
  const showFallback = loading || unavailable || !children

  return (
    <section
      className={`relative overflow-hidden rounded-[24px] border bg-white ${className}`}
      style={{
        minHeight: height,
        borderColor: 'var(--mzaya-border)',
        boxShadow: 'var(--mzaya-shadow-sm)',
      }}
      aria-label="Live delivery map"
    >
      {showFallback ? (
        <div
          className="flex h-full min-h-[inherit] flex-col items-center justify-center px-6 text-center"
          style={{ background: 'var(--mzaya-surface-subtle)' }}
          aria-live="polite"
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-[18px]"
            style={{
              background: 'var(--mzaya-primary-soft)',
              color: 'var(--mzaya-primary)',
            }}
          >
            {loading ? (
              <Navigation aria-hidden="true" size={23} strokeWidth={1.7} />
            ) : (
              <MapPin aria-hidden="true" size={23} strokeWidth={1.7} />
            )}
          </div>

          <h2
            className="mt-4 text-[16px] font-semibold"
            style={{ color: 'var(--mzaya-text-primary)' }}
          >
            {loading ? 'Loading live location' : 'Map temporarily unavailable'}
          </h2>

          <p
            className="mt-2 max-w-[300px] text-[12px] leading-5"
            style={{ color: 'var(--mzaya-text-muted)' }}
          >
            {loading
              ? 'We are connecting to the delivery tracking service.'
              : 'You can still follow the order using the status timeline below.'}
          </p>
        </div>
      ) : (
        children
      )}

      {onRecenter && !unavailable && (
        <div className="absolute bottom-4 right-4">
          <Button
            variant="secondary"
            size="sm"
            leadingIcon={LocateFixed}
            onClick={onRecenter}
          >
            Recenter
          </Button>
        </div>
      )}
    </section>
  )
}
