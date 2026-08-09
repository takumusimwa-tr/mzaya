import useMzayaPayoutReconciliation from '../../hooks/useMzayaPayoutReconciliation'
import MzayaPayoutReconciliationTable from '../../components/finance/MzayaPayoutReconciliationTable'
import '../../components/finance/mzayaPayout.css'

export default function MzayaPayoutReconciliation() {
  const {
    results,
    loading,
    reconcile,
  } = useMzayaPayoutReconciliation()

  if (loading) {
    return <p className="mzaya-payout-state">Loading Mzaya payout reconciliation…</p>
  }

  return (
    <main className="mzaya-payout-page">
      <header>
        <div>
          <p className="finance-eyebrow">Mzaya finance</p>
          <h1>Payout reconciliation</h1>
          <p>
            Mzaya payout, finance outbox, accounting event, and ledger lineage.
          </p>
        </div>
      </header>

      <MzayaPayoutReconciliationTable
        results={results}
        onReconcile={reconcile}
      />
    </main>
  )
}
