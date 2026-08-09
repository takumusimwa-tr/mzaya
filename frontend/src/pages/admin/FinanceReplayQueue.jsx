import useFinanceReplay from '../../hooks/useFinanceReplay'
import ReplayQueueTable from '../../components/finance/ReplayQueueTable'
import '../../components/finance/financeEventEngine.css'

export default function FinanceReplayQueue() {
  const {
    items,
    loading,
  } = useFinanceReplay()

  if (loading) {
    return <p className="finance-event-state">Loading replay queue…</p>
  }

  return (
    <main className="finance-event-page">
      <header>
        <div>
          <p className="finance-eyebrow">Accounting infrastructure</p>
          <h1>Replay queue</h1>
          <p>Controlled retries, backoff, and dead-letter visibility.</p>
        </div>
      </header>

      <ReplayQueueTable items={items} />
    </main>
  )
}
