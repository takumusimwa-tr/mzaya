import useTreasuryFinance from '../../hooks/useTreasuryFinance'
import TreasuryTransferTable from '../../components/finance/TreasuryTransferTable'
import BankMovementTable from '../../components/finance/BankMovementTable'
import '../../components/finance/treasuryFinance.css'

export default function TreasuryFinanceDashboard() {
  const {
    transfers,
    movements,
    loading,
    approve,
  } = useTreasuryFinance()

  if (loading) {
    return <p className="treasury-state">Loading treasury…</p>
  }

  return (
    <main className="treasury-page">
      <header>
        <div>
          <p className="finance-eyebrow">Treasury</p>
          <h1>Cash movement</h1>
          <p>
            Approved transfers, bank movements, provider references, and finance traceability.
          </p>
        </div>
      </header>

      <h2>Transfers</h2>
      <TreasuryTransferTable
        transfers={transfers}
        onApprove={approve}
      />

      <h2>Bank movements</h2>
      <BankMovementTable movements={movements} />
    </main>
  )
}
