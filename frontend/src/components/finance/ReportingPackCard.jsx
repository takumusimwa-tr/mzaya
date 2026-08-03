import PropTypes from 'prop-types'

export default function ReportingPackCard({ pack }) {
  return (
    <article className="reporting-pack-card">
      <div>
        <span>{pack.pack_type}</span>
        <strong>{pack.title}</strong>
      </div>
      <span>{pack.period_from} — {pack.period_to}</span>
      <strong>{pack.currency || 'Multi-currency'}</strong>
      <span>{pack.status}</span>
    </article>
  )
}

ReportingPackCard.propTypes = {
  pack: PropTypes.object.isRequired,
}
