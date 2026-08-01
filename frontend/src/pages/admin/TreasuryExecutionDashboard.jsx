import useTreasuryExecution from '../../hooks/useTreasuryExecution'
import TreasuryTransferTable from '../../components/finance/TreasuryTransferTable'
import '../../components/finance/treasuryExecution.css'

export default function TreasuryExecutionDashboard() {
  const {
    transfers,
    loading,
    approveTransfer,
    executeTransfer,
  } = useTreasuryExecution()

  if (loading) {
    return <p className="treasury-execution-state">Loading treasury execution…</p>
  }

  return (
    <main className="treasury-execution-page">
      <header>
        <p className="finance-eyebrow">Treasury operations</p>
        <h1>Transfer execution</h1>
        <p>
          Approvals, execution attempts, cross-currency transfers, and FX deals.
        </p>
      </header>

      <TreasuryTransferTable
        transfers={transfers}
        onApprove={approveTransfer}
        onExecute={executeTransfer}
      />
    </main>
  )
}
