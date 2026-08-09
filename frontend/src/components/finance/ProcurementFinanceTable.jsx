import PropTypes from 'prop-types'

function money(minor, currency) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(Number(minor || 0) / 100)
}

export default function ProcurementFinanceTable({
  procurements,
  onApprove,
  onComplete,
}) {
  return (
    <div className="procurement-finance-table">
      {procurements.map((item) => (
        <article key={item.id}>
          <div>
            <strong>{item.procurement_reference}</strong>
            <span>{item.vendor_id || 'No vendor assigned'}</span>
          </div>

          <strong>
            {money(item.amount_spent_minor, item.currency)}
          </strong>

          <span>{item.status}</span>

          {item.status === 'draft' ? (
            <button
              type="button"
              onClick={() => onApprove(item.id)}
            >
              Approve
            </button>
          ) : item.status === 'approved' ? (
            <button
              type="button"
              onClick={() => onComplete(item.id)}
            >
              Complete
            </button>
          ) : <span />}
        </article>
      ))}
    </div>
  )
}

ProcurementFinanceTable.propTypes = {
  procurements: PropTypes.array.isRequired,
  onApprove: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
}
