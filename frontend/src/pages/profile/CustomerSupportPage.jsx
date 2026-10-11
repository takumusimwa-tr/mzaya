/**
 * Customer support container.
 * Integration point: routed at /help from App.jsx.
 * Preserves the presentational HelpCenterPage while supplying local, searchable
 * support topics until a remote CMS/support service is introduced.
 */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HelpCenterPage from '../customer/HelpCenterPage'

const TOPICS = [
  {
    id: 'orders',
    title: 'Orders & delivery',
    description: 'Order status, tracking, changes and delivery questions.',
    articleCount: 4,
    icon: 'parcel',
  },
  {
    id: 'payments',
    title: 'Payments & refunds',
    description: 'Payment status, failed payments, refunds and receipts.',
    articleCount: 4,
    icon: 'card',
  },
  {
    id: 'account',
    title: 'Account & addresses',
    description: 'Profile details, saved addresses and account access.',
    articleCount: 3,
    icon: 'user',
  },
  {
    id: 'vendors',
    title: 'Vendors & items',
    description: 'Stores, item availability, substitutions and favorites.',
    articleCount: 3,
    icon: 'store',
  },
]

export default function CustomerSupportPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const topics = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return TOPICS
    return TOPICS.filter((topic) =>
      `${topic.title} ${topic.description}`.toLowerCase().includes(term)
    )
  }, [query])

  return (
    <HelpCenterPage
      topics={topics}
      query={query}
      onBack={() => navigate('/profile', { replace: true })}
      onQueryChange={setQuery}
      onSearch={setQuery}
      onTopicSelect={(topic) => navigate(`/help/faq?topic=${encodeURIComponent(topic.id)}`)}
      availability="Self-service help is available now."
      onEmail={() => {
        window.location.href = 'mailto:team.mzaya@gmail.com?subject=Mzaya%20support'
      }}
    />
  )
}
