/**
 * ============================================================================
 * MZAYA
 * Component: OrdersFilterTabs
 * Path: frontend/src/components/orders/OrdersFilterTabs.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Lets customers switch between active and historical order groups.
 *
 * Responsibilities
 * ----------------
 * • Render a compact tab control.
 * • Communicate the active tab accessibly.
 * • Forward the selected tab identifier to the parent.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not filter arrays internally.
 * • Does not fetch orders.
 * • Does not determine status grouping rules.
 *
 * Data Contract
 * -------------
 * tabs: Array<{
 *   id: string,
 *   label: string,
 *   count?: number
 * }>
 *
 * Used By
 * -------
 * • OrdersPage.jsx
 *
 * Design Notes
 * ------------
 * Keep the number of tabs small. Active and past orders should normally be
 * enough for the customer journey.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

export default function OrdersFilterTabs({
  tabs = [],
  value,
  onChange,
}) {
  return (
    <div
      className="inline-flex rounded-[14px] p-1"
      style={{ background: 'var(--mzaya-surface-muted)' }}
      role="tablist"
      aria-label="Order filters"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === value

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange?.(tab.id)}
            className="min-h-10 rounded-[11px] px-4 text-[12px] font-semibold outline-none transition-[background-color,box-shadow,color] focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
            style={{
              background: isActive ? 'var(--mzaya-surface)' : 'transparent',
              color: isActive
                ? 'var(--mzaya-text-primary)'
                : 'var(--mzaya-text-muted)',
              boxShadow: isActive ? 'var(--mzaya-shadow-xs)' : 'none',
            }}
          >
            {tab.label}
            {typeof tab.count === 'number' && (
              <span className="ml-1.5 opacity-70">({tab.count})</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
