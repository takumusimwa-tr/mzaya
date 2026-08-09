import useProcurementReconciliation from '../../hooks/useProcurementReconciliation'
import ProcurementReconciliationTable from '../../components/finance/ProcurementReconciliationTable'
import '../../components/finance/procurementFinance.css'

export default function ProcurementFinanceReconciliation() {
  const {
    results,
    loading,
    reconcile,
  } = useProcurementReconciliation()

  if (loading) {
    return <p className="procurement-finance-state">Loading procurement reconciliation…</p>
  }

  return (
    <main className="procurement-finance-page">
      <header>
        <div>
          <p className="finance-eyebrow">Procurement finance</p>
          <h1>Procurement reconciliation</h1>
          <p>
            Procurement record, outbox event, accounting event, and ledger lineage.
          </p>
        </div>
      </header>

      <ProcurementReconciliationTable
        results={results}
        onReconcile={reconcile}
      />
    </main>
  )
}
