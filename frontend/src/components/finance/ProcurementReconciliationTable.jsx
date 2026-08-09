import PropTypes from 'prop-types'

export default function ProcurementReconciliationTable({
  results,
  onReconcile,
}) {
  return (
    <div className="procurement-reconciliation-table">
      {results.map((item) => (
        <article key={item.id}>
          <div>
            <strong>{item.procurement_id}</strong>
            <span>{item.result_reference}</span>
          </div>

          <span>{item.currency || '—'}</span>

          <span className="procurement-finance-status">
            {item.status}
          </span>

          <button
            type="button"
            onClick={() => onReconcile(item.procurement_id)}
          >
            Recheck
          </button>
        </article>
      ))}
    </div>
  )
}

ProcurementReconciliationTable.propTypes = {
  results: PropTypes.array.isRequired,
  onReconcile: PropTypes.func.isRequired,
}
