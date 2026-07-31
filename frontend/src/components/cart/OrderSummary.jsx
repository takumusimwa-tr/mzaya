import Money from '../ui/Money'

function SummaryRow({
  label,
  value,
  strong = false,
  muted = false,
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={strong ? 'text-[15px] font-semibold' : 'text-[13px]'}
        style={{
          color: strong
            ? 'var(--mzaya-text-primary)'
            : 'var(--mzaya-text-secondary)',
        }}
      >
        {label}
      </span>

      <Money
        usd={value}
        size={strong ? 'lg' : 'base'}
        muted={muted}
      />
    </div>
  )
}

export default function OrderSummary({
  subtotal = 0,
  deliveryFee = 0,
  serviceFee = 0,
  discount = 0,
  total,
  className = '',
}) {
  const calculatedTotal =
    total ??
    Number(subtotal) +
      Number(deliveryFee) +
      Number(serviceFee) -
      Number(discount)

  return (
    <section
      className={`rounded-[22px] border bg-white p-5 ${className}`}
      style={{
        borderColor: 'var(--mzaya-border)',
        boxShadow: 'var(--mzaya-shadow-sm)',
      }}
      aria-labelledby="order-summary-heading"
    >
      <h2
        id="order-summary-heading"
        className="text-[17px] font-semibold tracking-[-0.015em]"
        style={{ color: 'var(--mzaya-text-primary)' }}
      >
        Order summary
      </h2>

      <div className="mt-4 flex flex-col gap-3">
        <SummaryRow label="Subtotal" value={subtotal} />
        <SummaryRow label="Delivery" value={deliveryFee} />
        {Number(serviceFee) > 0 && (
          <SummaryRow label="Service fee" value={serviceFee} />
        )}
        {Number(discount) > 0 && (
          <div className="flex items-center justify-between gap-4">
            <span
              className="text-[13px]"
              style={{ color: 'var(--mzaya-success)' }}
            >
              Discount
            </span>
            <span
              className="text-[14px] font-semibold"
              style={{ color: 'var(--mzaya-success)' }}
            >
              −US${Number(discount).toFixed(2)}
            </span>
          </div>
        )}
      </div>

      <div
        className="my-4 h-px"
        style={{ background: 'var(--mzaya-border)' }}
      />

      <SummaryRow label="Total" value={calculatedTotal} strong />
    </section>
  )
}
