import PropTypes from 'prop-types'

function money(value, currency) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(Number(value || 0) / 100)
}

export default function TreasuryKPIs({ position }) {
  const cards = [
    ['Total cash', money(position.totalCashMinor, position.currency)],
    ['Available cash', money(position.availableCashMinor, position.currency)],
    ['Restricted cash', money(position.restrictedCashMinor, position.currency)],
    ['Pending outflows', money(position.pendingOutflowsMinor, position.currency)],
  ]

  return (
    <section className="treasury-kpi-grid">
      {cards.map(([label, value]) => (
        <article key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </article>
      ))}
    </section>
  )
}

TreasuryKPIs.propTypes = {
  position: PropTypes.object.isRequired,
}
