import useFinanceFindings from '../../hooks/useFinanceFindings'
import AuditFindingTable from '../../components/finance/AuditFindingTable'
import '../../components/finance/financeAudit.css'

export default function FinanceFindingsDashboard() {
  const { findings, loading } = useFinanceFindings()

  if (loading) {
    return <p className="finance-audit-state">Loading audit findings…</p>
  }

  return (
    <main className="finance-audit-page">
      <header>
        <p className="finance-eyebrow">Finance assurance</p>
        <h1>Audit findings</h1>
        <p>Risk, severity, recurrence, ownership, and due dates.</p>
      </header>

      <AuditFindingTable findings={findings} />
    </main>
  )
}
