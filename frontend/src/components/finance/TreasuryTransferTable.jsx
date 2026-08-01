import PropTypes from 'prop-types'

export default function TreasuryTransferTable({
  transfers,
  onApprove,
  onExecute,
}) {
  return (
    <div className="treasury-transfer-table">
      {transfers.map((transfer) => (
        <article key={transfer.id}>
          <div>
            <strong>{transfer.transfer_reference}</strong>
            <span>
              {transfer.source_currency} → {transfer.destination_currency}
            </span>
          </div>

          <strong>
            {transfer.source_currency}{' '}
            {(Number(transfer.source_amount_minor) / 100).toFixed(2)}
          </strong>

          <span>{transfer.status}</span>

          <div className="treasury-transfer-table__actions">
            {transfer.status === 'draft' && (
              <button type="button" onClick={() => onApprove(transfer.id)}>
                Approve
              </button>
            )}
            {transfer.status === 'approved' && (
              <button type="button" onClick={() => onExecute(transfer.id)}>
                Execute
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}

TreasuryTransferTable.propTypes = {
  transfers: PropTypes.array.isRequired,
  onApprove: PropTypes.func.isRequired,
  onExecute: PropTypes.func.isRequired,
}
