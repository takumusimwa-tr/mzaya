import PropTypes from 'prop-types'

export default function VendorSettlementReconciliationTable({
  results,
  onReconcile,
}) {
  return (
    <div className="vendor-settlement-reconciliation-table">
      {results.map((item) => (
        <article key={item.id}>
          <div>
            <strong>{item.settlement_id}</strong>
            <span>{item.result_reference}</span>
          </div>
          <span>{item.currency || '—'}</span>
          <span className="vendor-settlement-status">
            {item.status}
          </span>
          <button
            type="button"
            onClick={() => onReconcile(item.settlement_id)}
          >
            Recheck
          </button>
        </article>
      ))}
    </div>
  )
}

VendorSettlementReconciliationTable.propTypes = {
  results: PropTypes.array.isRequired,
  onReconcile: PropTypes.func.isRequired,
}
