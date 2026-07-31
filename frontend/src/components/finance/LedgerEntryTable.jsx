import PropTypes from 'prop-types'

export default function LedgerEntryTable({ entries, currency }) {
  return (
    <div className="ledger-entry-table">
      <div className="ledger-entry-table__header">
        <span>Account</span>
        <span>Direction</span>
        <span>Amount</span>
      </div>

      {entries.map((entry) => (
        <div key={entry.id} className="ledger-entry-table__row">
          <code>{String(entry.account_id).slice(0, 8)}</code>
          <span>{entry.direction}</span>
          <strong>
            {currency} {(Number(entry.amount_minor) / 100).toFixed(2)}
          </strong>
        </div>
      ))}
    </div>
  )
}

LedgerEntryTable.propTypes = {
  entries: PropTypes.arrayOf(PropTypes.object).isRequired,
  currency: PropTypes.string.isRequired,
}
