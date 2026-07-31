/**
 * ============================================================================
 * MZAYA
 * Component: EmptyCart
 * Path: frontend/src/components/cart/EmptyCart.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Displays the empty state shown when a customer has no items in their cart.
 *
 * Responsibilities
 * ----------------
 * • Explain the empty state in clear, direct language.
 * • Provide one primary route back into shopping.
 * • Preserve the Mzaya premium visual system and accessibility standards.
 *
 * Data / State
 * ------------
 * This component is presentational. It does not read from the cart store and
 * does not perform API requests.
 *
 * Dependencies
 * ------------
 * • lucide-react
 * • Button.jsx
 *
 * Used By
 * -------
 * • CartPage.jsx
 *
 * Design Notes
 * ------------
 * Keep the state calm and functional. Do not introduce decorative illustrations,
 * gradients, confetti, emojis, or playful copy. Green is reserved for the action.
 *
 * Future Enhancements
 * -------------------
 * • Optional recently viewed products beneath the empty state.
 * • Optional merchant recommendations supplied by CartPage.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

import { ShoppingBag } from 'lucide-react'
import Button from '../ui/Button'

export default function EmptyCart({
  onBrowse,
  title = 'Your cart is empty',
  message = 'Browse nearby merchants and add what you need.',
}) {
  return (
    <section
      className="rounded-[24px] border bg-white px-6 py-14 text-center"
      style={{
        borderColor: 'var(--mzaya-border)',
        boxShadow: 'var(--mzaya-shadow-sm)',
      }}
      aria-labelledby="empty-cart-title"
    >
      <div
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px]"
        style={{
          background: 'var(--mzaya-primary-soft)',
          color: 'var(--mzaya-primary)',
        }}
      >
        <ShoppingBag aria-hidden="true" size={25} strokeWidth={1.7} />
      </div>

      <h2
        id="empty-cart-title"
        className="mt-5 text-[20px] font-semibold tracking-[-0.025em]"
        style={{ color: 'var(--mzaya-text-primary)' }}
      >
        {title}
      </h2>

      <p
        className="mx-auto mt-2 max-w-[280px] text-[14px] leading-6"
        style={{ color: 'var(--mzaya-text-secondary)' }}
      >
        {message}
      </p>

      <Button
        className="mt-7"
        size="md"
        onClick={onBrowse}
      >
        Browse merchants
      </Button>
    </section>
  )
}
