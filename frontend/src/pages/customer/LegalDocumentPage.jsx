/**
 * ============================================================================
 * MZAYA
 * Page: LegalDocumentPage
 * Path: frontend/src/pages/customer/LegalDocumentPage.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Provides a controlled container for one legal or policy document.
 *
 * Responsibilities
 * ----------------
 * • Display document title, update date and approved rendered content.
 * • Surface loading, error and unavailable states.
 * • Expose parent-controlled retry and back actions.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not fetch, parse or sanitize raw legal HTML.
 * • Does not track acceptance or consent.
 * • Does not infer legal meaning.
 *
 * Security Note
 * -------------
 * The parent must pass trusted, sanitized React content. Never inject raw remote
 * HTML directly into this page.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial page composition.
 * ============================================================================
 */

import { FileText } from 'lucide-react'
import AppHeader from '../../components/layout/AppHeader'
import PageShell from '../../components/layout/PageShell'
import Button from '../../components/ui/Button'

export default function LegalDocumentPage({
  document,
  content,
  loading = false,
  error = null,
  onBack,
  onRetry,
}) {
  return (
    <PageShell>
      <AppHeader
        title={document?.title ?? 'Legal document'}
        subtitle={
          document?.updatedAt || document?.updated_at
            ? `Updated ${document.updatedAt ?? document.updated_at}`
            : undefined
        }
        onBack={onBack}
      />

      <main
        className="mx-auto w-full max-w-3xl px-4 pb-12 pt-4 sm:px-6"
        aria-live="polite"
      >
        {loading ? (
          <div
            className="animate-pulse rounded-[24px] border bg-white p-6"
            style={{
              minHeight: 520,
              borderColor: 'var(--mzaya-border)',
              boxShadow: 'var(--mzaya-shadow-sm)',
            }}
            aria-label="Loading legal document"
          >
            <div
              className="h-6 w-56 rounded-full"
              style={{ background: 'var(--mzaya-surface-muted)' }}
            />
            {[100, 92, 86, 98, 74, 90].map((width, index) => (
              <div
                key={`${width}-${index}`}
                className="mt-5 h-3 rounded-full"
                style={{
                  width: `${width}%`,
                  background: 'var(--mzaya-surface-muted)',
                }}
              />
            ))}
          </div>
        ) : error ? (
          <section
            className="rounded-[24px] border bg-white px-6 py-12 text-center"
            style={{
              borderColor: 'var(--mzaya-border)',
              boxShadow: 'var(--mzaya-shadow-sm)',
            }}
          >
            <h1
              className="text-[20px] font-semibold"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              We could not load this document
            </h1>
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
        ) : document && content ? (
          <article
            className="rounded-[24px] border bg-white p-6 sm:p-8"
            style={{
              borderColor: 'var(--mzaya-border)',
              boxShadow: 'var(--mzaya-shadow-sm)',
              color: 'var(--mzaya-text-secondary)',
            }}
          >
            <header
              className="border-b pb-6"
              style={{ borderColor: 'var(--mzaya-border)' }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-[16px]"
                style={{
                  background: 'var(--mzaya-primary-soft)',
                  color: 'var(--mzaya-primary)',
                }}
              >
                <FileText aria-hidden="true" size={21} strokeWidth={1.8} />
              </div>
              <h1
                className="mt-5 text-[28px] font-semibold tracking-[-0.035em]"
                style={{ color: 'var(--mzaya-text-primary)' }}
              >
                {document.title}
              </h1>
              {(document.updatedAt || document.updated_at) && (
                <p
                  className="mt-2 text-[11px]"
                  style={{ color: 'var(--mzaya-text-muted)' }}
                >
                  Last updated {document.updatedAt ?? document.updated_at}
                </p>
              )}
            </header>

            <div className="prose prose-sm mt-7 max-w-none">{content}</div>
          </article>
        ) : (
          <section
            className="rounded-[24px] border bg-white px-6 py-12 text-center"
            style={{
              borderColor: 'var(--mzaya-border)',
              boxShadow: 'var(--mzaya-shadow-sm)',
            }}
          >
            <h1
              className="text-[20px] font-semibold"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              Document unavailable
            </h1>
            <p
              className="mx-auto mt-2 max-w-[360px] text-[13px] leading-6"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              This document is not available right now.
            </p>
          </section>
        )}
      </main>
    </PageShell>
  )
}
