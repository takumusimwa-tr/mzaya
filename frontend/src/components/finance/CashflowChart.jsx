import PropTypes from 'prop-types'

export default function CashflowChart({ rows }) {
  return (
    <section className="finance-chart-card">
      <header>
        <h2>Cash movement</h2>
        <p>GMV, refunds, and paid settlements</p>
      </header>

      <div className="finance-series-list">
        {rows.map((row) => (
          <article key={row.snapshot_date}>
            <time>{row.snapshot_date}</time>
            <span>GMV {Number(row.gmv_minor) / 100}</span>
            <span>Refunds {Number(row.refunds_minor) / 100}</span>
            <span>Settled {Number(row.settlements_paid_minor) / 100}</span>
          </article>
        ))}
      </div>
    </section>
  )
}

CashflowChart.propTypes = {
  rows: PropTypes.array.isRequired,
}
