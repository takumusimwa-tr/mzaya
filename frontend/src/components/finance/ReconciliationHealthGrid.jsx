import PropTypes from 'prop-types'

export default function ReconciliationHealthGrid({ snapshots }) {
  const latest = new Map()

  snapshots.forEach((snapshot) => {
    if (!latest.has(snapshot.domain_key)) {
      latest.set(snapshot.domain_key, snapshot)
    }
  })

  return (
    <section className="cross-domain-health-grid">
      {[...latest.values()].map((snapshot) => (
        <article key={snapshot.id}>
          <span>{snapshot.domain_key}</span>
          <strong>
            {(Number(snapshot.match_rate || 0) * 100).toFixed(2)}%
          </strong>
          <small>
            {snapshot.exception_records} exceptions · {snapshot.stale_records} stale
          </small>
        </article>
      ))}
    </section>
  )
}

ReconciliationHealthGrid.propTypes = {
  snapshots: PropTypes.array.isRequired,
}
