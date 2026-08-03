import PropTypes from 'prop-types'

function money(value, currency) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(Number(value || 0) / 100)
}

export default function ExecutiveFinanceKPIs({ totals, currency }) {
  const cards = [
    ['Gross order value', money(totals.govMinor, currency)],
    ['Recognized revenue', money(totals.revenueMinor, currency)],
    ['Contribution margin', `${((totals.contributionMarginRatio || 0) * 100).toFixed(1)}%`],
    ['Net margin', `${((totals.netMarginRatio || 0) * 100).toFixed(1)}%`],
    ['Revenue / order', money(totals.revenuePerOrderMinor, currency)],
    ['Orders', Number(totals.orderCount || 0).toLocaleString()],
  ]

  return (
    <section className="executive-finance-kpis">
      {cards.map(([label, value]) => (
        <article key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </article>
      ))}
    </section>
  )
}

ExecutiveFinanceKPIs.propTypes = {
  totals: PropTypes.object.isRequired,
  currency: PropTypes.string.isRequired,
}
