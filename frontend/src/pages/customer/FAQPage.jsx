/**
 * ============================================================================
 * MZAYA
 * Page: FAQPage
 * Path: frontend/src/pages/customer/FAQPage.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Composes a searchable list of frequently asked customer questions.
 *
 * Responsibilities
 * ----------------
 * • Display parent-filtered FAQ entries.
 * • Forward search and expansion events.
 * • Render loading, empty and error states.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not fetch or search remote content.
 * • Does not generate support answers.
 * • Does not navigate directly.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial page composition.
 * ============================================================================
 */

import { ArrowLeft, ChevronDown, Search } from 'lucide-react'
import PageShell from '../../components/layout/PageShell'
import Button from '../../components/ui/Button'

export default function FAQPage({
  query = '',
  entries = [],
  expandedId = null,
  loading = false,
  error = null,
  onBack,
  onRetry,
  onQueryChange,
  onToggleEntry,
}) {
  return (
    <PageShell>
      <main
        className="mx-auto w-full max-w-3xl px-4 pb-12 pt-4 sm:px-6"
        aria-live="polite"
      >
        <header className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-11 w-11 items-center justify-center rounded-[15px] border bg-white outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
            style={{
              borderColor: 'var(--mzaya-border)',
              color: 'var(--mzaya-text-primary)',
            }}
            aria-label="Go back"
          >
            <ArrowLeft size={19} strokeWidth={1.8} />
          </button>
          <div>
            <h1
              className="text-[24px] font-semibold tracking-[-0.035em]"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              Frequently asked questions
            </h1>
            <p
              className="mt-1 text-[12px]"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              Quick answers about orders, payments and delivery.
            </p>
          </div>
        </header>

        <div className="relative mt-6">
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
            placeholder="Search questions"
            className="h-12 w-full rounded-[17px] border bg-white pl-12 pr-4 text-[13px] outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
            style={{
              borderColor: 'var(--mzaya-border)',
              color: 'var(--mzaya-text-primary)',
              boxShadow: 'var(--mzaya-shadow-sm)',
            }}
          />
        </div>

        {loading ? (
          <div className="mt-6 space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-[20px] border"
                style={{
                  minHeight: 76,
                  borderColor: 'var(--mzaya-border)',
                  background: 'var(--mzaya-surface)',
                }}
                aria-hidden="true"
              />
            ))}
          </div>
        ) : error ? (
          <section
            className="mt-6 rounded-[24px] border bg-white px-6 py-12 text-center"
            style={{
              borderColor: 'var(--mzaya-border)',
              boxShadow: 'var(--mzaya-shadow-sm)',
            }}
          >
            <h2
              className="text-[20px] font-semibold"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              We could not load these questions
            </h2>
            <p
              className="mx-auto mt-2 max-w-[380px] text-[13px] leading-6"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              {error}
            </p>
            {onRetry && (
              <Button onClick={onRetry} className="mt-6">
                Try again
              </Button>
            )}
          </section>
        ) : entries.length ? (
          <section
            className="mt-6 overflow-hidden rounded-[22px] border bg-white"
            style={{
              borderColor: 'var(--mzaya-border)',
              boxShadow: 'var(--mzaya-shadow-sm)',
            }}
            aria-label="Frequently asked questions"
          >
            {entries.map((entry, index) => {
              const expanded = expandedId === entry.id
              return (
                <article
                  key={entry.id}
                  className={index ? 'border-t' : ''}
                  style={{ borderColor: 'var(--mzaya-border)' }}
                >
                  <button
                    type="button"
                    onClick={() => onToggleEntry?.(entry)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                    aria-expanded={expanded}
                    aria-controls={`faq-answer-${entry.id}`}
                  >
                    <span
                      className="text-[13px] font-semibold"
                      style={{ color: 'var(--mzaya-text-primary)' }}
                    >
                      {entry.question}
                    </span>
                    <ChevronDown
                      size={18}
                      strokeWidth={1.8}
                      aria-hidden="true"
                      className={`flex-shrink-0 transition-transform ${
                        expanded ? 'rotate-180' : ''
                      }`}
                      style={{ color: 'var(--mzaya-text-muted)' }}
                    />
                  </button>

                  {expanded && (
                    <div
                      id={`faq-answer-${entry.id}`}
                      className="px-5 pb-5 text-[12px] leading-6"
                      style={{ color: 'var(--mzaya-text-secondary)' }}
                    >
                      {entry.answer}
                    </div>
                  )}
                </article>
              )
            })}
          </section>
        ) : (
          <section
            className="mt-6 rounded-[24px] border bg-white px-6 py-12 text-center"
            style={{
              borderColor: 'var(--mzaya-border)',
              boxShadow: 'var(--mzaya-shadow-sm)',
            }}
          >
            <h2
              className="text-[20px] font-semibold"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              No matching questions
            </h2>
            <p
              className="mx-auto mt-2 max-w-[360px] text-[13px] leading-6"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              Try a different search term or contact support.
            </p>
          </section>
        )}
      </main>
    </PageShell>
  )
}
