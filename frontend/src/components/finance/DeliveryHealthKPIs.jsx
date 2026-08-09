import PropTypes from 'prop-types'

export default function DeliveryHealthKPIs({ snapshot }) {
  const cards = [
    ['Pending', snapshot?.pending_count || 0],
    ['Failed', snapshot?.failed_count || 0],
    ['Dead letters', snapshot?.dead_letter_count || 0],
    ['Oldest pending', `${snapshot?.oldest_pending_age_seconds || 0}s`],
    ['Consumer lag', `${snapshot?.consumer_lag_seconds || 0}s`],
    ['Health', snapshot?.health_status || 'unknown'],
  ]

  return (
    <section className="finance-reliability-kpis">
      {cards.map(([label, value]) => (
        <article key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </article>
      ))}
    </section>
  )
}

DeliveryHealthKPIs.propTypes = {
  snapshot: PropTypes.object,
}

DeliveryHealthKPIs.defaultProps = {
  snapshot: null,
}
