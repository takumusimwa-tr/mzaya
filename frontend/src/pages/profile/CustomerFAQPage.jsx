/**
 * Customer FAQ container.
 * Integration point: /help/faq.
 * Keeps FAQPage presentational and owns filtering/expanded state here.
 */
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import FAQPage from '../customer/FAQPage'

const FAQS = [
  { id:'order-status', topic:'orders', question:'Where can I see my order status?', answer:'Open My Orders, choose the order, then use its tracking and status information.' },
  { id:'order-change', topic:'orders', question:'Can I change an order after placing it?', answer:'Changes depend on the order stage. Use the order details and support options before fulfillment is completed.' },
  { id:'delivery-address', topic:'orders', question:'Which address will my order use?', answer:'The delivery address confirmed during checkout is the address used for that order.' },
  { id:'tracking', topic:'orders', question:'How do I track an active delivery?', answer:'Open the active order from My Orders and select its tracking view when tracking is available.' },
  { id:'payment-status', topic:'payments', question:'Where can I confirm whether payment succeeded?', answer:'Use the order details and payment status shown for that order. Do not retry repeatedly while a payment is still processing.' },
  { id:'refund', topic:'payments', question:'How do refunds work?', answer:'Refund eligibility and timing depend on the order and payment state. Keep the affected order available when contacting support.' },
  { id:'failed-payment', topic:'payments', question:'What should I do after a failed payment?', answer:'Confirm the failure state first, then retry from the supported checkout flow rather than creating duplicate payments.' },
  { id:'receipt', topic:'payments', question:'Where is my payment record?', answer:'Your order details are the primary customer record for the order and its payment state.' },
  { id:'profile', topic:'account', question:'How do I update my profile?', answer:'Open Profile, choose Edit profile, update your name, email or phone, then save.' },
  { id:'addresses', topic:'account', question:'How do I manage saved addresses?', answer:'Open Profile and choose Saved Addresses to add, edit, remove or select a default address.' },
  { id:'account-role', topic:'account', question:'Can I change my account role from Profile?', answer:'No. Profile editing only changes safe personal account fields; account roles are not self-service profile fields.' },
  { id:'favorites', topic:'vendors', question:'Where can I find favorite vendors?', answer:'Open Profile and choose Favorites.' },
  { id:'availability', topic:'vendors', question:'Why might an item be unavailable?', answer:'Vendor inventory and availability can change. Review the current vendor page before checkout.' },
  { id:'vendor-application', topic:'vendors', question:'How do I apply to sell on Mzaya?', answer:'Open Profile and choose Sell on Mzaya to enter the vendor onboarding flow.' },
]

export default function CustomerFAQPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [query, setQuery] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const topic = params.get('topic')

  const entries = useMemo(() => {
    const term = query.trim().toLowerCase()
    return FAQS.filter((entry) => {
      const inTopic = !topic || entry.topic === topic
      const matches = !term || `${entry.question} ${entry.answer}`.toLowerCase().includes(term)
      return inTopic && matches
    })
  }, [query, topic])

  return (
    <FAQPage
      query={query}
      entries={entries}
      expandedId={expandedId}
      onBack={() => navigate('/help', { replace: true })}
      onQueryChange={setQuery}
      onToggleEntry={(entry) => setExpandedId((current) => current === entry.id ? null : entry.id)}
    />
  )
}
