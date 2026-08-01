import PropTypes from 'prop-types'

function money(value, currency) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(Number(value || 0) / 100)
}

export default function TaxReturnTable({
  returns,
  onApprove,
  onSubmit,
}) {
  return (
    <div className="tax-return-table">
      {returns.map((item) => (
        <article key={item.id}>
          <div>
            <strong>{item.return_reference}</strong>
            <span>{item.status}</span>
          </div>
          <strong>{money(item.net_tax_due_minor, item.currency)}</strong>
          <div className="tax-return-table__actions">
            {item.status === 'draft' && (
              <button type="button" onClick={() => onApprove(item.id)}>
                Approve
              </button>
            )}
            {item.status === 'approved' && (
              <button
                type="button"
                onClick={() => {
                  const reference = window.prompt('Submission reference')
                  if (reference) onSubmit(item.id, reference)
                }}
              >
                Mark submitted
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}

TaxReturnTable.propTypes = {
  returns: PropTypes.array.isRequired,
  onApprove: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
}
