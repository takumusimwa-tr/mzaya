import useFinanceDelivery from '../../hooks/useFinanceDelivery'
import OutboxQueueTable from '../../components/finance/OutboxQueueTable'
import '../../components/finance/financeReliability.css'

export default function FinanceDeliveryMonitor() {
  const {
    outbox,
    loading,
  } = useFinanceDelivery()

  if (loading) {
    return <p className="finance-reliability-state">Loading delivery monitor…</p>
  }

  return (
    <main className="finance-reliability-page">
      <header>
        <div>
          <p className="finance-eyebrow">Finance infrastructure</p>
          <h1>Event delivery</h1>
          <p>
            Transactional outbox state, retry timing, and delivery health.
          </p>
        </div>
      </header>

      <OutboxQueueTable items={outbox} />
    </main>
  )
}
