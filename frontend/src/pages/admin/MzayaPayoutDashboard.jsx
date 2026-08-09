import useMzayaPayouts from '../../hooks/useMzayaPayouts'
import MzayaPayoutTable from '../../components/finance/MzayaPayoutTable'
import '../../components/finance/mzayaPayout.css'

export default function MzayaPayoutDashboard() {
  const {
    payouts,
    loading,
    approve,
  } = useMzayaPayouts()

  if (loading) {
    return <p className="mzaya-payout-state">Loading Mzaya payouts…</p>
  }

  return (
    <main className="mzaya-payout-page">
      <header>
        <div>
          <p className="finance-eyebrow">Mzaya finance</p>
          <h1>Mzaya payouts</h1>
          <p>
            Delivery earnings, tips, incentives, deductions, payout state, and finance traceability.
          </p>
        </div>
      </header>

      <MzayaPayoutTable
        payouts={payouts}
        onApprove={approve}
      />
    </main>
  )
}
