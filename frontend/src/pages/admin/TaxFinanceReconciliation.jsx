import useTaxReconciliation from '../../hooks/useTaxReconciliation'
import TaxReconciliationTable from '../../components/finance/TaxReconciliationTable'
import '../../components/finance/taxFinance.css'

export default function TaxFinanceReconciliation() {
  const {
    results,
    loading,
    reconcile,
  } = useTaxReconciliation()

  if (loading) {
    return <p className="tax-finance-state">Loading tax reconciliation…</p>
  }

  return (
    <main className="tax-finance-page">
      <header>
        <div>
          <p className="finance-eyebrow">Tax</p>
          <h1>Tax reconciliation</h1>
          <p>
            Tax transaction, outbox, accounting event, and ledger lineage.
          </p>
        </div>
      </header>

      <TaxReconciliationTable
        results={results}
        onReconcile={reconcile}
      />
    </main>
  )
}
