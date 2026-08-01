import PropTypes from 'prop-types'

export default function BankAccountCard({ account }) {
  return (
    <article className="bank-account-card">
      <div>
        <span>{account.bank_name}</span>
        <strong>{account.account_name}</strong>
      </div>
      <code>•••• {account.account_last4}</code>
      <strong>
        {account.currency}{' '}
        {(Number(account.available_balance_minor) / 100).toFixed(2)}
      </strong>
    </article>
  )
}

BankAccountCard.propTypes = {
  account: PropTypes.object.isRequired,
}
