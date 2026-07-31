/**
 * ============================================================================
 * MZAYA
 * Component: PaymentStatusView
 * Path: frontend/src/components/payment/PaymentStatusView.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Selects the correct payment-state component from a normalized payment status.
 *
 * Responsibilities
 * ----------------
 * • Keep PaymentPage render logic compact.
 * • Map processing, success and failure states to dedicated components.
 * • Provide a safe fallback for unknown or delayed statuses.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not normalize provider-specific statuses.
 * • Does not poll payment APIs.
 * • Does not infer success from navigation state.
 *
 * Expected Statuses
 * -----------------
 * processing | pending | success | paid | failed | cancelled
 *
 * Integration Note
 * ----------------
 * Normalize gateway-specific values in the payment service or page adapter
 * before passing status here. Avoid adding provider names to this UI component.
 *
 * Dependencies
 * ------------
 * • PaymentProcessingState.jsx
 * • PaymentFailureState.jsx
 * • PaymentSuccessState.jsx
 *
 * Used By
 * -------
 * • PaymentPage.jsx
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

import PaymentFailureState from './PaymentFailureState'
import PaymentProcessingState from './PaymentProcessingState'
import PaymentSuccessState from './PaymentSuccessState'

const SUCCESS_STATUSES = new Set(['success', 'paid'])
const FAILURE_STATUSES = new Set(['failed', 'cancelled'])
const PROCESSING_STATUSES = new Set(['processing', 'pending'])

export default function PaymentStatusView({
  status,
  processingProps,
  successProps,
  failureProps,
}) {
  const normalizedStatus = String(status || 'processing').toLowerCase()

  if (SUCCESS_STATUSES.has(normalizedStatus)) {
    return <PaymentSuccessState {...successProps} />
  }

  if (FAILURE_STATUSES.has(normalizedStatus)) {
    return <PaymentFailureState {...failureProps} />
  }

  // Unknown statuses intentionally fall back to processing rather than showing
  // a false failure or, more importantly, a false success.
  if (
    PROCESSING_STATUSES.has(normalizedStatus) ||
    !SUCCESS_STATUSES.has(normalizedStatus)
  ) {
    return <PaymentProcessingState {...processingProps} />
  }

  return null
}
