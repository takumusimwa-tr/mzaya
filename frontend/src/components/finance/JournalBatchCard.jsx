import PropTypes from 'prop-types'

export default function JournalBatchCard({ batch }) {
  return (
    <article className="finance-journal-batch-card">
      <div>
        <span>{batch.period_key}</span>
        <strong>{batch.batch_reference}</strong>
      </div>
      <strong>{batch.event_count} events</strong>
      <span>{batch.currency}</span>
      <span className="finance-event-status">{batch.status}</span>
    </article>
  )
}

JournalBatchCard.propTypes = {
  batch: PropTypes.object.isRequired,
}
