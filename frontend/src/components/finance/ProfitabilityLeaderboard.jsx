import PropTypes from 'prop-types'

export default function ProfitabilityLeaderboard({ snapshots }) {
  const ranked = snapshots
    .slice()
    .sort(
      (a, b) =>
        Number(b.contribution_margin_minor || 0) -
        Number(a.contribution_margin_minor || 0)
    )
    .slice(0, 8)

  return (
    <section className="executive-finance-panel">
      <header>
        <div>
          <span>Performance</span>
          <h2>Profitability leaders</h2>
        </div>
      </header>

      <div className="profitability-leaderboard">
        {ranked.map((item, index) => (
          <article key={item.id}>
            <span>{index + 1}</span>
            <div>
              <strong>{item.dimension_value}</strong>
              <small>{item.dimension_type}</small>
            </div>
            <strong>
              {item.currency}{' '}
              {(Number(item.contribution_margin_minor) / 100).toFixed(2)}
            </strong>
          </article>
        ))}
      </div>
    </section>
  )
}

ProfitabilityLeaderboard.propTypes = {
  snapshots: PropTypes.array.isRequired,
}
