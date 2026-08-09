import useFinanceDeadLetters from '../../hooks/useFinanceDeadLetters'
import DeadLetterTable from '../../components/finance/DeadLetterTable'
import '../../components/finance/financeReliability.css'

export default function FinanceDeadLetterQueue() {
  const {
    items,
    loading,
    replay,
  } = useFinanceDeadLetters()

  if (loading) {
    return <p className="finance-reliability-state">Loading dead letters…</p>
  }

  return (
    <main className="finance-reliability-page">
      <header>
        <div>
          <p className="finance-eyebrow">Finance infrastructure</p>
          <h1>Dead-letter queue</h1>
          <p>Quarantined events, exhausted retries, and controlled replay.</p>
        </div>
      </header>

      <DeadLetterTable
        items={items}
        onReplay={replay}
      />
    </main>
  )
}
