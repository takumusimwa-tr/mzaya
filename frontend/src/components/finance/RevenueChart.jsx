import PropTypes from 'prop-types'

function maxValue(rows) {
  return Math.max(
    1,
    ...rows.map((row) => Number(row.platform_revenue_minor || 0))
  )
}

export default function RevenueChart({ rows, currency }) {
  const maximum = maxValue(rows)

  return (
    <section className="finance-chart-card">
      <header>
        <h2>Platform revenue</h2>
        <p>Daily service-fee revenue</p>
      </header>

      <div className="finance-bar-chart" role="img" aria-label="Revenue trend">
        {rows.map((row) => (
          <div key={row.snapshot_date}>
            <span
              style={{
                height: `${Math.max(
                  4,
                  (Number(row.platform_revenue_minor) / maximum) * 100
                )}%`,
              }}
              title={`${row.snapshot_date}: ${currency} ${(
                Number(row.platform_revenue_minor) / 100
              ).toFixed(2)}`}
            />
            <small>{row.snapshot_date.slice(5)}</small>
          </div>
        ))}
      </div>
    </section>
  )
}

RevenueChart.propTypes = {
  rows: PropTypes.array.isRequired,
  currency: PropTypes.string.isRequired,
}
