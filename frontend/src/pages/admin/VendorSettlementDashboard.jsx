import useVendorSettlements from '../../hooks/useVendorSettlements'
import VendorSettlementTable from '../../components/finance/VendorSettlementTable'
import '../../components/finance/vendorSettlement.css'

export default function VendorSettlementDashboard() {
  const {
    settlements,
    loading,
    approve,
  } = useVendorSettlements()

  if (loading) {
    return <p className="vendor-settlement-state">Loading vendor settlements…</p>
  }

  return (
    <main className="vendor-settlement-page">
      <header>
        <div>
          <p className="finance-eyebrow">Vendor finance</p>
          <h1>Vendor settlements</h1>
          <p>
            Settlement liabilities, approvals, payout state, and finance traceability.
          </p>
        </div>
      </header>

      <VendorSettlementTable
        settlements={settlements}
        onApprove={approve}
      />
    </main>
  )
}
