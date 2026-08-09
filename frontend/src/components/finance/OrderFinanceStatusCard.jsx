import PropTypes from 'prop-types'

export default function OrderFinanceStatusCard({ results }) {
  const matched = results.filter((item) => item.status === 'matched').length
  const exceptions = results.filter((item) => item.status === 'exception').length

  return (
    <section className="order-finance-kpis">
      <article>
        <span>Matched</span>
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

OrderFinanceStatusCard.propTypes = {
  results: PropTypes.array.isRequired,
}
