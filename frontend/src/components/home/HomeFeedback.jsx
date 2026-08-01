import { Store } from 'lucide-react'
import emptyProducts from '../../assets/brand/illustrations/empty-states/mzaya-empty-products.svg'

export function HomeSectionHeading({ title, count, countLabel = 'place' }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2 className="text-[20px] font-semibold tracking-[-0.025em]" style={{ color: 'var(--mzaya-text-primary)' }}>
        {title}
      </h2>
      {count > 0 && (
        <span className="pb-0.5 text-[12px] font-medium" style={{ color: 'var(--mzaya-text-muted)' }}>
          {count} {countLabel}{count === 1 ? '' : 's'}
        </span>
      )}
    </div>
  )
}

export function HomeSkeletonList() {
  return (
    <div className="flex flex-col gap-4" aria-label="Loading content">
      {[1, 2, 3].map((item) => (
        <div key={item} className="animate-pulse overflow-hidden rounded-[24px] border bg-white" style={{ borderColor: 'var(--mzaya-border)' }}>
          <div className="h-44" style={{ background: 'var(--mzaya-neutral-200)' }} />
          <div className="p-4">
            <div className="mb-3 h-4 w-2/3 rounded" style={{ background: 'var(--mzaya-neutral-200)' }} />
            <div className="h-3 w-1/2 rounded" style={{ background: 'var(--mzaya-neutral-100)' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function HomeEmptyState({ search, productMode = false }) {
  return (
    <div className="rounded-[24px] border bg-white px-6 py-14 text-center" style={{ borderColor: 'var(--mzaya-border)' }}>
      {productMode ? (
        // Brand guideline: the no-products card uses the Mzaya illustration.
        <img src={emptyProducts} alt="" aria-hidden="true"
          className="mx-auto w-52 max-w-full select-none" draggable="false" />
      ) : (
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: 'var(--mzaya-surface-muted)', color: 'var(--mzaya-green-800)' }}>
          <Store aria-hidden="true" size={22} strokeWidth={1.6} />
        </div>
      )}
      <p className="mt-4 text-[15px] font-semibold" style={{ color: 'var(--mzaya-text-primary)' }}>
        {search ? 'Nothing matched that search' : productMode ? 'No products available yet' : 'No merchants available yet'}
      </p>
      <p className="mx-auto mt-1 max-w-[240px] text-[13px] leading-5" style={{ color: 'var(--mzaya-text-muted)' }}>
        {search ? 'Try a product, merchant, or service name.' : 'Availability will appear here as merchants come online.'}
      </p>
    </div>
  )
}
