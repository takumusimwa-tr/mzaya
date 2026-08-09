import useTreasuryReconciliation from '../../hooks/useTreasuryReconciliation'
import TreasuryReconciliationTable from '../../components/finance/TreasuryReconciliationTable'
import '../../components/finance/treasuryFinance.css'

export default function TreasuryFinanceReconciliation() {
  const {
    results,
    loading,
    reconcile,
  } = useTreasuryReconciliation()

  if (loading) {
    return <p className="treasury-state">Loading treasury reconciliation…</p>
  }

  return (
    <main className="treasury-page">
      <header>
        <div>
          <p className="finance-eyebrow">Treasury</p>
          <h1>Bank reconciliation</h1>
          <p>
            Treasury transfer, outbox, accounting event, ledger, and bank movement lineage.
          </p>
        </div>
      </header>

      <TreasuryReconciliationTable
        results={results}
        onReconcile={reconcile}
      />
    </main>
  )
}
