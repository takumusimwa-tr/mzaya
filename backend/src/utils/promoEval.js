// backend/src/utils/promoEval.js
// Validates a promo code and computes its discount for a given order.
// Shared by /quote (preview) and order placement (authoritative) so the
// discount shown to the customer always matches what's charged.

// Evaluate a loaded promo row against order amounts.
// Returns { valid, reason, discount_usd, freeDelivery } — never throws.
function evaluatePromo(promo, { subtotalUsd, deliveryFeeUsd }) {
  const sub = Number(subtotalUsd) || 0;
  const fee = Number(deliveryFeeUsd) || 0;

  if (!promo) {
    return { valid: false, reason: 'Code not found', discount_usd: 0, freeDelivery: false };
  }
  if (!promo.is_active) {
    return { valid: false, reason: 'This code is no longer active', discount_usd: 0, freeDelivery: false };
  }
  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return { valid: false, reason: 'This code has expired', discount_usd: 0, freeDelivery: false };
  }
  if (promo.usage_limit != null && promo.used_count >= promo.usage_limit) {
    return { valid: false, reason: 'This code has reached its usage limit', discount_usd: 0, freeDelivery: false };
  }
  if (Number(promo.min_order_usd) > 0 && sub < Number(promo.min_order_usd)) {
    return {
      valid: false,
      reason: `Spend at least $${Number(promo.min_order_usd).toFixed(2)} to use this code`,
      discount_usd: 0,
      freeDelivery: false,
    };
  }

  let discount = 0;
  let freeDelivery = false;

  switch (promo.type) {
    case 'percent': {
      // Percentage off the subtotal (not the tip, not the fee).
      discount = sub * (Number(promo.value) / 100);
      if (promo.max_discount_usd != null) {
        discount = Math.min(discount, Number(promo.max_discount_usd));
      }
      break;
    }
    case 'fixed': {
      // Flat dollar amount off, capped so it never exceeds subtotal + fee.
      discount = Math.min(Number(promo.value), sub + fee);
      break;
    }
    case 'free_delivery': {
      discount = fee;
      freeDelivery = true;
      break;
    }
    default:
      return { valid: false, reason: 'Invalid promo type', discount_usd: 0, freeDelivery: false };
  }

  // Discount can never exceed subtotal + fee (tip is protected separately).
  discount = Math.max(0, Math.min(discount, sub + fee));
  discount = parseFloat(discount.toFixed(2));

  return { valid: true, reason: null, discount_usd: discount, freeDelivery };
}

module.exports = { evaluatePromo };
