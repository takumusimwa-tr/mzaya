import useFinanceRemediation from '../../hooks/useFinanceRemediation'
import RemediationTracker from '../../components/finance/RemediationTracker'
import '../../components/finance/financeAudit.css'

export default function RemediationDashboard() {
  const {
    actions,
    loading,
    complete,
    verify,
  } = useFinanceRemediation()

  if (loading) {
    return <p className="finance-audit-state">Loading remediation…</p>
  }

  return (
    <main className="finance-audit-page">
      <header>
        <p className="finance-eyebrow">Finance assurance</p>
        <h1>Remediation</h1>
        <p>Management actions, due dates, completion evidence, and verification.</p>
      </header>

      <RemediationTracker
        actions={actions}
        onComplete={complete}
        onVerify={verify}
      />
    </main>
  )
}
