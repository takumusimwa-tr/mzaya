import useTreasuryRisk from '../../hooks/useTreasuryRisk'
import FXExposureCard from '../../components/finance/FXExposureCard'
import TreasuryAlertBanner from '../../components/finance/TreasuryAlertBanner'
import '../../components/finance/treasuryRisk.css'

export default function TreasuryRiskDashboard() {
  const {
    exposures,
    alerts,
    loading,
  } = useTreasuryRisk()

  if (loading) {
    return <p className="treasury-risk-state">Loading treasury risk…</p>
  }

  return (
    <main className="treasury-risk-page">
      <header>
        <p className="finance-eyebrow">Treasury governance</p>
        <h1>FX & exposure</h1>
        <p>
          Currency exposure, treasury limits, alerts, and liquidity concentration.
        </p>
      </header>

      <section className="treasury-alert-stack">
        {alerts.map((alert) => (
          <TreasuryAlertBanner key={alert.id} alert={alert} />
        ))}
      </section>

      <section className="fx-exposure-grid">
        {exposures.map((exposure) => (
          <FXExposureCard key={exposure.id} exposure={exposure} />
        ))}
      </section>
    </main>
  )
}
