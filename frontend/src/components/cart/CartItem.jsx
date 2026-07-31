import { Trash2, PackageOpen } from 'lucide-react'
import QuantityStepper from '../ui/QuantityStepper'
import Money from '../ui/Money'
import imageUrl from '../../utils/imageUrl'

export default function CartItem({
  item,
  onIncrease,
  onDecrease,
  onRemove,
  disabled = false,
}) {
  const product = item.product ?? item
  const quantity = Number(item.quantity || 1)
  const unitPrice = Number(
    item.unit_price_usd ??
    item.price_usd ??
    product.price_usd ??
    0
  )
  const lineTotal = unitPrice * quantity

  return (
    <article
      className="rounded-[22px] border bg-white p-3.5"
      style={{
        borderColor: 'var(--mzaya-border)',
        boxShadow: 'var(--mzaya-shadow-sm)',
      }}
    >
      <div className="flex gap-3.5">
        <div
          className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-[17px]"
          style={{ background: 'var(--mzaya-surface-muted)' }}
        >
          {product.image_url ? (
            <img
              src={imageUrl(product.image_url, 300)}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <PackageOpen
              aria-hidden="true"
              size={27}
              strokeWidth={1.4}
              style={{ color: 'var(--mzaya-neutral-400)' }}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3
                className="line-clamp-2 text-[15px] font-semibold leading-5"
                style={{ color: 'var(--mzaya-text-primary)' }}
              >
                {product.name}
              </h3>

              {(product.variant_name || item.variant_name) && (
                <p
                  className="mt-1 text-[12px]"
                  style={{ color: 'var(--mzaya-text-muted)' }}
                >
                  {product.variant_name || item.variant_name}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onRemove}
              disabled={disabled}
              aria-label={`Remove ${product.name} from cart`}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full outline-none transition-colors disabled:opacity-40 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
              style={{
                background: 'var(--mzaya-error-soft)',
                color: 'var(--mzaya-error)',
              }}
            >
              <Trash2 aria-hidden="true" size={16} strokeWidth={1.8} />
            </button>
          </div>

          <div className="mt-3 flex items-end justify-between gap-3">
            <QuantityStepper
              value={quantity}
              onDecrease={onDecrease}
              onIncrease={onIncrease}
              disabled={disabled}
              size="sm"
            />

            <Money usd={lineTotal} size="base" />
          </div>
        </div>
      </div>
    </article>
  )
}
