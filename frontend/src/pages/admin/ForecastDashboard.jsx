import useForecasts from '../../hooks/useForecasts'
import '../../components/finance/budgeting.css'

export default function ForecastDashboard() {
  const {
    forecasts,
    loading,
  } = useForecasts()

  if (loading) {
    return <p className="budgeting-state">Loading forecasts…</p>
  }

  return (
    <main className="budgeting-page">
      <header>
        <p className="finance-eyebrow">Financial planning</p>
        <h1>Forecasts</h1>
        <p>
          Rolling revenue, expense, and scenario projections.
        </p>
      </header>

      <section className="forecast-list">
        {forecasts.map((forecast) => (
          <article key={forecast.id}>
            <div>
              <strong>{forecast.name}</strong>
              <span>{forecast.forecast_type}</span>
            </div>
            <strong>{forecast.currency}</strong>
            <span>{forecast.horizon_months} months</span>
          </article>
        ))}
      </section>
    </main>
  )
}
