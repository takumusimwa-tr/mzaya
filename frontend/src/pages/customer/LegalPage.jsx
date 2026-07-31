/**
 * ============================================================================
 * MZAYA
 * Page: LegalPage
 * Path: frontend/src/pages/customer/LegalPage.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Composes the customer-facing legal and policy document index.
 *
 * Responsibilities
 * ----------------
 * • Display legal documents and update metadata.
 * • Forward document selection to the application layer.
 * • Surface loading, error and unavailable states.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not fetch or render legal document bodies.
 * • Does not track consent.
 * • Does not determine whether acknowledgement is legally required.
 *
 * Canonical Component Policy
 * --------------------------
 * Uses:
 *   frontend/src/components/profile/LegalDocumentRow.jsx
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial page composition.
 * ============================================================================
 */

import { Scale } from 'lucide-react'
import AppHeader from '../../components/layout/AppHeader'
import PageShell from '../../components/layout/PageShell'
import Button from '../../components/ui/Button'
import LegalDocumentRow from '../../components/profile/LegalDocumentRow'

export default function LegalPage({
  documents = [],
  loading = false,
  error = null,
  onBack,
  onRetry,
  onOpenDocument,
}) {
  return (
    <PageShell>
      <AppHeader
        title="Legal and policies"
        subtitle="Terms, privacy and platform policies."
        onBack={onBack}
      />

      <main
        className="mx-auto w-full max-w-3xl px-4 pb-12 pt-4 sm:px-6"
        aria-live="polite"
      >
        <section
          className="mb-5 rounded-[22px] border p-5"
          style={{
            borderColor: 'var(--mzaya-border)',
            background: 'var(--mzaya-surface)',
          }}
        >
          <div className="flex gap-3">
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[14px]"
              style={{
                background: 'var(--mzaya-primary-soft)',
                color: 'var(--mzaya-primary)',
              }}
            >
              <Scale aria-hidden="true" size={19} strokeWidth={1.8} />
            </div>
            <div>
              <h2
                className="text-[14px] font-semibold"
                style={{ color: 'var(--mzaya-text-primary)' }}
              >
                Mzaya policies
              </h2>
              <p
                className="mt-1 text-[12px] leading-5"
                style={{ color: 'var(--mzaya-text-muted)' }}
              >
                These documents explain how the platform operates and how your
                information, orders and payments are handled.
              </p>
            </div>
          </div>
        </section>

        {loading ? (
          <div
            className="animate-pulse overflow-hidden rounded-[22px] border bg-white"
            style={{
              borderColor: 'var(--mzaya-border)',
              boxShadow: 'var(--mzaya-shadow-sm)',
            }}
            aria-label="Loading legal documents"
          >
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="border-b p-4 last:border-b-0"
                style={{ borderColor: 'var(--mzaya-border)' }}
              >
                <div
                  className="h-4 w-40 rounded-full"
                  style={{ background: 'var(--mzaya-surface-muted)' }}
                />
                <div
                  className="mt-2 h-3 w-56 rounded-full"
                  style={{ background: 'var(--mzaya-surface-muted)' }}
                />
              </div>
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
              We could not load legal documents
            </h1>
            <p
              className="mx-auto mt-2 max-w-[380px] text-[13px] leading-6"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              {error}
            </p>
            {onRetry && (
              <Button onClick={onRetry} className="mt-6 min-w-[140px]">
                Try again
              </Button>
            )}
          </section>
        ) : documents.length ? (
          <section
            className="overflow-hidden rounded-[22px] border bg-white"
            style={{
              borderColor: 'var(--mzaya-border)',
              boxShadow: 'var(--mzaya-shadow-sm)',
            }}
            aria-label="Legal documents"
          >
            {documents.map((document, index) => (
              <div
                key={document.id}
                className={index ? 'border-t' : ''}
                style={{ borderColor: 'var(--mzaya-border)' }}
              >
                <LegalDocumentRow
                  title={document.title}
                  description={document.description}
                  updatedAt={document.updatedAt ?? document.updated_at}
                  onOpen={
                    onOpenDocument
                      ? () => onOpenDocument(document)
                      : undefined
                  }
                />
              </div>
            ))}
          </section>
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
              Documents unavailable
            </h1>
            <p
              className="mx-auto mt-2 max-w-[360px] text-[13px] leading-6"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              Legal and policy documents are not available right now.
            </p>
          </section>
        )}
      </main>
    </PageShell>
  )
}
