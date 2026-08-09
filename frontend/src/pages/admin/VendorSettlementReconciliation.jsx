import useVendorSettlementReconciliation from '../../hooks/useVendorSettlementReconciliation'
import VendorSettlementReconciliationTable from '../../components/finance/VendorSettlementReconciliationTable'
import '../../components/finance/vendorSettlement.css'

export default function VendorSettlementReconciliation() {
  const {
    results,
    loading,
    reconcile,
  } = useVendorSettlementReconciliation()

  if (loading) {
    return <p className="vendor-settlement-state">Loading settlement reconciliation…</p>
  }

  return (
    <main className="vendor-settlement-page">
      <header>
        <div>
          <p className="finance-eyebrow">Vendor finance</p>
          <h1>Settlement reconciliation</h1>
          <p>
            Vendor settlement, finance outbox, accounting event, and ledger lineage.
          </p>
        </div>
      </header>

      <VendorSettlementReconciliationTable
        results={results}
        onReconcile={reconcile}
      />
    </main>
  )
}
