/**
 * ============================================================================
 * MZAYA
 * Page: AboutMzayaPage
 * Path: frontend/src/pages/customer/AboutMzayaPage.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Presents concise platform, version and company information for customers.
 *
 * Responsibilities
 * ----------------
 * • Explain Mzaya's role as a trusted commerce and delivery platform.
 * • Display app version and environment-approved company details.
 * • Expose parent-controlled links for policies, support and updates.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not fetch remote company information.
 * • Does not navigate directly.
 * • Does not expose internal build metadata or infrastructure details.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial page composition.
 * ============================================================================
 */

import { ArrowUpRight, ShieldCheck, Sparkles, Truck } from 'lucide-react'
import AppHeader from '../../components/layout/AppHeader'
import PageShell from '../../components/layout/PageShell'
import Button from '../../components/ui/Button'

export default function AboutMzayaPage({
  version,
  buildLabel,
  companyName = 'Mzaya',
  supportText = 'Mzaya connects customers, merchants and mzayas through one trusted commerce and delivery platform.',
  onBack,
  onOpenLegal,
  onOpenSupport,
  onCheckUpdates,
}) {
  return (
    <PageShell>
      <AppHeader
        title="About Mzaya"
        subtitle="Trusted commerce and delivery, built for Zimbabwe."
        onBack={onBack}
      />

      <main className="mx-auto w-full max-w-3xl px-4 pb-12 pt-4 sm:px-6">
        <section
          className="overflow-hidden rounded-[28px] border p-6 sm:p-8"
          style={{
            borderColor: 'var(--mzaya-border)',
            background:
              'linear-gradient(145deg, var(--mzaya-primary-soft), var(--mzaya-surface))',
            boxShadow: 'var(--mzaya-shadow-md)',
          }}
        >
          <div
            className="flex h-16 w-16 items-center justify-center rounded-[20px]"
            style={{
              background: 'var(--mzaya-primary)',
              color: 'white',
            }}
          >
            <Sparkles aria-hidden="true" size={27} strokeWidth={1.7} />
          </div>

          <p
            className="mt-7 text-[12px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: 'var(--mzaya-primary)' }}
          >
            Tumai Mzaya
          </p>

          <h1
            className="mt-2 text-[30px] font-semibold tracking-[-0.04em] sm:text-[38px]"
            style={{ color: 'var(--mzaya-text-primary)' }}
          >
            One trusted platform for everyday commerce.
          </h1>

          <p
            className="mt-4 max-w-[620px] text-[14px] leading-7"
            style={{ color: 'var(--mzaya-text-secondary)' }}
          >
            {supportText}
          </p>
        </section>

        <section className="mt-5 grid gap-4 sm:grid-cols-2">
          <article
            className="rounded-[22px] border bg-white p-5"
            style={{
              borderColor: 'var(--mzaya-border)',
              boxShadow: 'var(--mzaya-shadow-sm)',
            }}
          >
            <Truck
              aria-hidden="true"
              size={21}
              strokeWidth={1.8}
              style={{ color: 'var(--mzaya-primary)' }}
            />
            <h2
              className="mt-4 text-[15px] font-semibold"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              Built around trust
            </h2>
            <p
              className="mt-2 text-[12px] leading-6"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              Clear order progress, dependable delivery and customer support
              designed around real local needs.
            </p>
          </article>

          <article
            className="rounded-[22px] border bg-white p-5"
            style={{
              borderColor: 'var(--mzaya-border)',
              boxShadow: 'var(--mzaya-shadow-sm)',
            }}
          >
            <ShieldCheck
              aria-hidden="true"
              size={21}
              strokeWidth={1.8}
              style={{ color: 'var(--mzaya-primary)' }}
            />
            <h2
              className="mt-4 text-[15px] font-semibold"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              Designed responsibly
            </h2>
            <p
              className="mt-2 text-[12px] leading-6"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              Secure account, payment and privacy practices are treated as part
              of the product—not an afterthought.
            </p>
          </article>
        </section>

        <section
          className="mt-5 rounded-[22px] border bg-white p-5"
          style={{
            borderColor: 'var(--mzaya-border)',
            boxShadow: 'var(--mzaya-shadow-sm)',
          }}
          aria-labelledby="app-information-heading"
        >
          <h2
            id="app-information-heading"
            className="text-[15px] font-semibold"
            style={{ color: 'var(--mzaya-text-primary)' }}
          >
            App information
          </h2>

          <dl className="mt-4 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <dt
                className="text-[12px]"
                style={{ color: 'var(--mzaya-text-muted)' }}
              >
                Product
              </dt>
              <dd
                className="text-[12px] font-medium"
                style={{ color: 'var(--mzaya-text-primary)' }}
              >
                {companyName}
              </dd>
            </div>

            {version && (
              <div className="flex items-center justify-between gap-4">
                <dt
                  className="text-[12px]"
                  style={{ color: 'var(--mzaya-text-muted)' }}
                >
                  Version
                </dt>
                <dd
                  className="text-[12px] font-medium"
                  style={{ color: 'var(--mzaya-text-primary)' }}
                >
                  {version}
                </dd>
              </div>
            )}

            {buildLabel && (
              <div className="flex items-center justify-between gap-4">
                <dt
                  className="text-[12px]"
                  style={{ color: 'var(--mzaya-text-muted)' }}
                >
                  Build
                </dt>
                <dd
                  className="text-[12px] font-medium"
                  style={{ color: 'var(--mzaya-text-primary)' }}
                >
                  {buildLabel}
                </dd>
              </div>
            )}
          </dl>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {onOpenSupport && (
              <Button variant="outline" onClick={onOpenSupport}>
                Support
              </Button>
            )}
            {onOpenLegal && (
              <Button variant="outline" onClick={onOpenLegal}>
                Legal
              </Button>
            )}
            {onCheckUpdates && (
              <Button
                variant="outline"
                trailingIcon={ArrowUpRight}
                onClick={onCheckUpdates}
              >
                Check updates
              </Button>
            )}
          </div>
        </section>
      </main>
    </PageShell>
  )
}
