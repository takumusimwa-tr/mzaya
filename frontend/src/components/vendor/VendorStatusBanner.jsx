/**
 * ============================================================================
 * MZAYA
 * Component: VendorStatusBanner
 * Path: frontend/src/components/vendor/VendorStatusBanner.jsx
 * ----------------------------------------------------------------------------
 * Purpose
 * -------
 * Displays concise success, warning or error feedback in vendor workflows.
 *
 * Responsibilities
 * ----------------
 * • Presents status messaging with an appropriate icon and live-region role.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not clear itself, retry requests or own mutation state.
 *
 * Accessibility
 * -------------
 * Error messages use role="alert"; other states use role="status".
 *
 * Change Log
 * ----------
 * July 2026 — Initial premium vendor implementation.
 * ============================================================================
 */

import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

const CONFIG = {
  success: {
    icon: CheckCircle2,
    background: 'var(--mzaya-success-soft)',
    color: 'var(--mzaya-success)',
  },
  error: {
    icon: AlertCircle,
    background: 'var(--mzaya-error-soft)',
    color: 'var(--mzaya-error)',
  },
  info: {
    icon: Info,
    background: 'var(--mzaya-primary-soft)',
    color: 'var(--mzaya-primary)',
  },
}

export default function VendorStatusBanner({
  tone = 'info',
  title,
  message,
}) {
  const config = CONFIG[tone] || CONFIG.info
  const Icon = config.icon

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className="flex items-start gap-3 rounded-[16px] px-4 py-3.5"
      style={{ background: config.background, color: config.color }}
    >
      <Icon className="mt-0.5 shrink-0" size={17} strokeWidth={1.8} aria-hidden="true" />
      <div>
        {title && <p className="text-[12px] font-semibold">{title}</p>}
        {message && <p className="mt-0.5 text-[11px] leading-5 opacity-90">{message}</p>}
      </div>
    </div>
  )
}
