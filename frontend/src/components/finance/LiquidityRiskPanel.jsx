import PropTypes from 'prop-types'

export default function LiquidityRiskPanel({
  liquidity,
  alerts,
  currency,
}) {
  return (
    <section className="executive-finance-panel">
      <header>
        <div>
          <span>Treasury</span>
          <h2>Liquidity & risk</h2>
        </div>
        <strong>{alerts.length} open alerts</strong>
      </header>

      <div className="liquidity-risk-grid">
        <article>
          <span>Available cash</span>
          <strong>
            {currency}{' '}
            {(Number(liquidity?.available_cash_minor || 0) / 100).toFixed(2)}
          </strong>
        </article>
        <article>
          <span>Pending outflows</span>
          <strong>
            {currency}{' '}
            {(Number(liquidity?.pending_outflows_minor || 0) / 100).toFixed(2)}
          </strong>
        </article>
        <article>
          <span>Runway</span>
          <strong>{liquidity?.runway_days || '—'} days</strong>
        </article>
      </div>
    </section>
  )
}

LiquidityRiskPanel.propTypes = {
  liquidity: PropTypes.object,
  alerts: PropTypes.array.isRequired,
  currency: PropTypes.string.isRequired,
}

LiquidityRiskPanel.defaultProps = {
  liquidity: null,
}
