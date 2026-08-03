import PropTypes from 'prop-types'

export default function IntercompanyTable({ transactions }) {
  return (
    <div className="intercompany-table">
      {transactions.map((transaction) => (
        <article key={transaction.id}>
          <div>
            <strong>{transaction.intercompany_reference}</strong>
            <span>{transaction.transaction_type}</span>
          </div>
          <strong>
            {transaction.currency}{' '}
            {(Number(transaction.amount_minor) / 100).toFixed(2)}
          </strong>
          <span>{transaction.reconciliation_status}</span>
        </article>
      ))}
    </div>
  )
}

IntercompanyTable.propTypes = {
  transactions: PropTypes.array.isRequired,
}
