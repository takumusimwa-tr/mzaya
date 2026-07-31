import PropTypes from 'prop-types'

function money(value, currency) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(Number(value || 0) / 100)
}

export default function FinanceKPICards({
  metrics,
  profitability,
  cashflow,
}) {
  const cards = [
    ['Gross merchandise value', money(metrics.gmvMinor, metrics.currency)],
    ['Platform revenue', money(metrics.platformRevenueMinor, metrics.currency)],
    ['Contribution', money(profitability.contributionMinor, metrics.currency)],
    ['Net cashflow', money(cashflow.netCashflowMinor, metrics.currency)],
    ['Pending settlements', money(metrics.settlementsPendingMinor, metrics.currency)],
    ['Reconciliation exceptions', metrics.reconciliationExceptionCount],
  ]

  return (
    <section className="finance-kpi-grid">
      {cards.map(([label, value]) => (
        <article key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </article>
      ))}
    </section>
  )
}

FinanceKPICards.propTypes = {
  metrics: PropTypes.object.isRequired,
  profitability: PropTypes.object.isRequired,
  cashflow: PropTypes.object.isRequired,
}
