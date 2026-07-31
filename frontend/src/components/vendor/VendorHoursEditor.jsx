/**
 * ============================================================================
 * MZAYA
 * Component: VendorHoursEditor
 * Path: frontend/src/components/vendor/VendorHoursEditor.jsx
 * ----------------------------------------------------------------------------
 * Purpose
 * -------
 * Canonical seven-day operating-hours editor for vendor locations.
 *
 * Responsibilities
 * ----------------
 * • Renders all supported weekday rows.
 * • Forwards day-level patches to parent-owned state.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not seed, validate or persist opening-hours data.
 *
 * Change Log
 * ----------
 * July 2026 — Initial premium vendor implementation.
 * ============================================================================
 */

import VendorBusinessHoursRow from './VendorBusinessHoursRow'

export const VENDOR_DAYS = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
]

export const DEFAULT_VENDOR_HOURS = {
  open: '08:00',
  close: '22:00',
  closed: false,
}

export default function VendorHoursEditor({ hours, onDayChange }) {
  return (
    <div>
      {VENDOR_DAYS.map((day) => (
        <VendorBusinessHoursRow
          key={day.key}
          dayKey={day.key}
          label={day.label}
          value={hours?.[day.key] || DEFAULT_VENDOR_HOURS}
          onChange={(patch) => onDayChange(day.key, patch)}
        />
      ))}
    </div>
  )
}
