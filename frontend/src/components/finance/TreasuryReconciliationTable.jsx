import PropTypes from 'prop-types'

export default function TreasuryReconciliationTable({
  results,
  onReconcile,
}) {
  return (
    <div className="treasury-reconciliation-table">
      {results.map((item) => (
        <article key={item.id}>
          <div>
            <strong>{item.transfer_id}</strong>
            <span>{item.result_reference}</span>
          </div>
          <span>{item.currency || '—'}</span>
          <span className="treasury-status">{item.status}</span>
          <button
            type="button"
            onClick={() => onReconcile(item.transfer_id)}
          >
            Recheck
          </button>
        </article>
      ))}
    </div>
  )
}

TreasuryReconciliationTable.propTypes = {
  results: PropTypes.array.isRequired,
  onReconcile: PropTypes.func.isRequired,
}
