import PropTypes from 'prop-types'

export default function TaxReconciliationTable({
  results,
  onReconcile,
}) {
  return (
    <div className="tax-reconciliation-table">
      {results.map((item) => (
        <article key={item.id}>
          <div>
            <strong>{item.tax_transaction_id}</strong>
            <span>{item.result_reference}</span>
          </div>
          <span>{item.currency || '—'}</span>
          <span className="tax-finance-status">{item.status}</span>
          <button
            type="button"
            onClick={() => onReconcile(item.tax_transaction_id)}
          >
            Recheck
          </button>
        </article>
      ))}
    </div>
  )
}

TaxReconciliationTable.propTypes = {
  results: PropTypes.array.isRequired,
  onReconcile: PropTypes.func.isRequired,
}
