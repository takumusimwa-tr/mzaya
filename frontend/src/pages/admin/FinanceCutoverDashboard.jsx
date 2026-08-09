import useFinanceCutover from '../../hooks/useFinanceCutover'
import CutoverControlCard from '../../components/finance/CutoverControlCard'
import CutoverReadinessTable from '../../components/finance/CutoverReadinessTable'
import LegacyPostingAttemptTable from '../../components/finance/LegacyPostingAttemptTable'
import '../../components/finance/financeCutover.css'

export default function FinanceCutoverDashboard() {
  const {
    controls,
    checks,
    legacyAttempts,
    loading,
    requestCutover,
    rollback,
  } = useFinanceCutover()

  if (loading) {
    return <p className="finance-cutover-state">Loading finance cutover…</p>
  }

  return (
    <main className="finance-cutover-page">
      <header>
        <div>
          <p className="finance-eyebrow">Finance migration</p>
          <h1>Cutover control</h1>
          <p>
            Controlled activation of the finance event engine and retirement of legacy ledger paths.
          </p>
        </div>
      </header>

      <section className="cutover-control-grid">
        {controls.map((control) => (
          <CutoverControlCard
            key={control.id}
            control={control}
            onRequest={requestCutover}
            onRollback={rollback}
          />
        ))}
      </section>

      <h2>Readiness evidence</h2>
      <CutoverReadinessTable checks={checks} />

      <h2>Legacy posting attempts</h2>
      <LegacyPostingAttemptTable attempts={legacyAttempts} />
    </main>
  )
}
