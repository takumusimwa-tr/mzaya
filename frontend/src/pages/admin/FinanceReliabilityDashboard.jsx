import useFinanceReliability from '../../hooks/useFinanceReliability'
import DeliveryHealthKPIs from '../../components/finance/DeliveryHealthKPIs'
import ConsumerLagCard from '../../components/finance/ConsumerLagCard'
import '../../components/finance/financeReliability.css'

export default function FinanceReliabilityDashboard() {
  const {
    snapshots,
    consumers,
    loading,
  } = useFinanceReliability()

  if (loading) {
    return <p className="finance-reliability-state">Loading reliability…</p>
  }

  const latest = snapshots[0] || null

  return (
    <main className="finance-reliability-page">
      <header>
        <div>
          <p className="finance-eyebrow">Finance infrastructure</p>
          <h1>Reliability</h1>
          <p>
            Delivery latency, backlog age, dead letters, stale leases, and consumer lag.
          </p>
        </div>
      </header>

      <DeliveryHealthKPIs snapshot={latest} />

      <section className="consumer-lag-grid">
        {consumers.map((consumer) => (
          <ConsumerLagCard
            key={consumer.id}
            consumer={consumer}
          />
        ))}
      </section>
    </main>
  )
}
