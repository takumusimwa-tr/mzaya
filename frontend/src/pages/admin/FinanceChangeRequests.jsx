import useFinanceChangeRequests from '../../hooks/useFinanceChangeRequests'
import ChangeApprovalPanel from '../../components/finance/ChangeApprovalPanel'
import '../../components/finance/financeMasterData.css'

export default function FinanceChangeRequests() {
  const { requests, loading, decide } = useFinanceChangeRequests()
  if (loading) return <p className="finance-master-data-state">Loading finance changes…</p>

  return (
    <main className="finance-master-data-page">
      <header>
        <div>
          <p className="finance-eyebrow">Finance governance</p>
          <h1>Change requests</h1>
          <p>Before-and-after review, impact assessment, and independent approval.</p>
        </div>
      </header>
      <section className="change-request-grid">
        {requests.map((request) => (
          <ChangeApprovalPanel key={request.id} request={request} onDecision={decide} />
        ))}
      </section>
    </main>
  )
}
