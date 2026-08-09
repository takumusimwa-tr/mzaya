import PropTypes from 'prop-types'

export default function PaymentFinanceStatusCard({ results }) {
  const matched = results.filter((item) => item.status === 'matched').length
  const exceptions = results.filter((item) => item.status === 'exception').length

  return (
    <section className="payment-finance-kpis">
      <article>
        <span>Reconciled</span>
        <strong>{matched}</strong>
      </article>
      <article>
        <span>Exceptions</span>
        <strong>{exceptions}</strong>
      </article>
      <article>
        <span>Evaluated</span>
        <strong>{results.length}</strong>
      </article>
    </section>
  )
}

PaymentFinanceStatusCard.propTypes = {
  results: PropTypes.array.isRequired,
}
