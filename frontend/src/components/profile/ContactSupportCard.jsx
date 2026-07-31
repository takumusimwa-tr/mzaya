/**
 * ============================================================================
 * MZAYA
 * Component: ContactSupportCard
 * Path: frontend/src/components/profile/ContactSupportCard.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Provides direct, controlled entry points into Mzaya customer support.
 *
 * Responsibilities
 * ----------------
 * • Present chat, email or call actions supplied by the parent.
 * • Display current support availability text.
 * • Keep support options clear and secondary to self-service help.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not open communication channels directly.
 * • Does not expose private support contact details.
 * • Does not create or route support cases.
 *
 * Dependencies
 * ------------
 * • Button.jsx
 * • lucide-react
 *
 * Used By
 * -------
 * • HelpCenterPage.jsx
 * • SupportPage.jsx
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

import { Mail, MessageCircle, Phone } from 'lucide-react'
import Button from '../ui/Button'

export default function ContactSupportCard({
  availability = 'Support is available every day.',
  onChat,
  onEmail,
  onCall,
}) {
  return (
    <section
      className="rounded-[22px] border bg-white p-5"
      style={{
        borderColor: 'var(--mzaya-border)',
        boxShadow: 'var(--mzaya-shadow-sm)',
      }}
      aria-labelledby="contact-support-heading"
    >
      <h2
        id="contact-support-heading"
        className="text-[16px] font-semibold"
        style={{ color: 'var(--mzaya-text-primary)' }}
      >
        Contact Mzaya support
      </h2>

      <p
        className="mt-1 text-[12px] leading-5"
        style={{ color: 'var(--mzaya-text-muted)' }}
      >
        {availability}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {onChat && (
          <Button
            variant="outline"
            leadingIcon={MessageCircle}
            onClick={onChat}
          >
            Chat
          </Button>
        )}

        {onEmail && (
          <Button
            variant="outline"
            leadingIcon={Mail}
            onClick={onEmail}
          >
            Email
          </Button>
        )}

        {onCall && (
          <Button
            variant="outline"
            leadingIcon={Phone}
            onClick={onCall}
          >
            Call
          </Button>
        )}
      </div>
    </section>
  )
}
