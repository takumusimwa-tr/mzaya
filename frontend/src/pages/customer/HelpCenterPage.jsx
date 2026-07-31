/**
 * ============================================================================
 * MZAYA
 * Page: HelpCenterPage
 * Path: frontend/src/pages/customer/HelpCenterPage.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Composes the customer help-center landing experience.
 *
 * Responsibilities
 * ----------------
 * • Display searchable support topics.
 * • Surface direct support channels.
 * • Forward topic, search and contact actions to the application layer.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not search remote support content.
 * • Does not create support tickets.
 * • Does not open communication channels directly.
 *
 * Canonical Component Policy
 * --------------------------
 * Uses:
 *   SupportTopicCard.jsx
 *   ContactSupportCard.jsx
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial page composition.
 * ============================================================================
 */

import { Search } from 'lucide-react'
import AppHeader from '../../components/layout/AppHeader'
import PageShell from '../../components/layout/PageShell'
import Button from '../../components/ui/Button'
import SupportTopicCard from '../../components/profile/SupportTopicCard'
import ContactSupportCard from '../../components/profile/ContactSupportCard'

export default function HelpCenterPage({
  topics = [],
  query = '',
  loading = false,
  error = null,
  availability,
  onBack,
  onRetry,
  onQueryChange,
  onSearch,
  onTopicSelect,
  onChat,
  onEmail,
  onCall,
}) {
  return (
    <PageShell>
      <AppHeader
        title="Help center"
        subtitle="Find answers or contact Mzaya support."
        onBack={onBack}
      />

      <main
        className="mx-auto w-full max-w-4xl px-4 pb-12 pt-4 sm:px-6"
        aria-live="polite"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault()
            onSearch?.(query)
          }}
          className="relative"
          role="search"
        >
          <Search
            aria-hidden="true"
            size={18}
            strokeWidth={1.8}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--mzaya-text-muted)' }}
          />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange?.(event.target.value)}
            placeholder="Search orders, payments, account help..."
            className="h-13 w-full rounded-[18px] border bg-white pl-12 pr-4 text-[13px] outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
            style={{
              borderColor: 'var(--mzaya-border)',
              color: 'var(--mzaya-text-primary)',
              boxShadow: 'var(--mzaya-shadow-sm)',
            }}
            aria-label="Search help center"
          />
        </form>

        <section className="mt-6" aria-labelledby="support-topics-heading">
          <h2
            id="support-topics-heading"
            className="mb-3 text-[16px] font-semibold"
            style={{ color: 'var(--mzaya-text-primary)' }}
          >
            Browse help topics
          </h2>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-[20px] border bg-white p-4"
                  style={{
                    minHeight: 120,
                    borderColor: 'var(--mzaya-border)',
                    boxShadow: 'var(--mzaya-shadow-xs)',
                  }}
                  aria-hidden="true"
                />
              ))}
            </div>
          ) : error ? (
            <div
              className="rounded-[22px] border bg-white px-6 py-10 text-center"
              style={{
                borderColor: 'var(--mzaya-border)',
                boxShadow: 'var(--mzaya-shadow-sm)',
              }}
            >
              <p
                className="text-[13px] leading-6"
                style={{ color: 'var(--mzaya-text-muted)' }}
              >
                {error}
              </p>
              {onRetry && (
                <Button onClick={onRetry} className="mt-5">
                  Try again
                </Button>
              )}
            </div>
          ) : topics.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {topics.map((topic) => (
                <SupportTopicCard
                  key={topic.id}
                  title={topic.title}
                  description={topic.description}
                  articleCount={topic.articleCount ?? topic.article_count}
                  icon={topic.icon}
                  onSelect={
                    onTopicSelect
                      ? () => onTopicSelect(topic)
                      : undefined
                  }
                />
              ))}
            </div>
          ) : (
            <p
              className="rounded-[22px] border bg-white px-6 py-10 text-center text-[13px]"
              style={{
                borderColor: 'var(--mzaya-border)',
                color: 'var(--mzaya-text-muted)',
              }}
            >
              No help topics are available right now.
            </p>
          )}
        </section>

        <div className="mt-6">
          <ContactSupportCard
            availability={availability}
            onChat={onChat}
            onEmail={onEmail}
            onCall={onCall}
          />
        </div>
      </main>
    </PageShell>
  )
}
