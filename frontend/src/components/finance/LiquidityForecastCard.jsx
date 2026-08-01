import PropTypes from 'prop-types'

export default function LiquidityForecastCard({ forecast }) {
  const rows = Array.isArray(forecast.forecast_data)
    ? forecast.forecast_data
    : []

  const closing = rows.at(-1)?.closingCashMinor || 0

  return (
    <article className="liquidity-forecast-card">
      <div>
        <strong>{forecast.forecast_reference}</strong>
        <span>{forecast.forecast_start} — {forecast.forecast_end}</span>
      </div>
      <strong>
        {forecast.currency} {(Number(closing) / 100).toFixed(2)}
      </strong>
      <span>{forecast.status}</span>
    </article>
  )
}

LiquidityForecastCard.propTypes = {
  forecast: PropTypes.object.isRequired,
}
