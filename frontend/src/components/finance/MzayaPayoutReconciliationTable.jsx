import PropTypes from 'prop-types'

export default function MzayaPayoutReconciliationTable({
  results,
  onReconcile,
}) {
  return (
    <div className="mzaya-payout-reconciliation-table">
      {results.map((item) => (
        <article key={item.id}>
          <div>
            <strong>{item.payout_id}</strong>
            <span>{item.result_reference}</span>
          </div>
          <span>{item.currency || '—'}</span>
          <span className="mzaya-payout-status">
            {item.status}
          </span>
          <button
            type="button"
            onClick={() => onReconcile(item.payout_id)}
          >
            Recheck
          </button>
        </article>
      ))}
    </div>
  )
}

MzayaPayoutReconciliationTable.propTypes = {
  results: PropTypes.array.isRequired,
  onReconcile: PropTypes.func.isRequired,
}
