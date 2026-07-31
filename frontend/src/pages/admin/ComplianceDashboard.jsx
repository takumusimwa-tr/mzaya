import useCompliance from '../../hooks/useCompliance'
import FinancialPeriodTable from '../../components/finance/FinancialPeriodTable'
import ComplianceAuditTable from '../../components/finance/ComplianceAuditTable'
import '../../components/finance/taxCompliance.css'

export default function ComplianceDashboard() {
  const {
    periods,
    audit,
    loading,
    closePeriod,
    reopenPeriod,
  } = useCompliance()

  if (loading) {
    return <p className="tax-compliance-state">Loading compliance data…</p>
  }

  return (
    <main className="compliance-dashboard">
      <header>
        <p className="finance-eyebrow">Financial governance</p>
        <h1>Compliance</h1>
        <p>Financial periods, control actions, and immutable audit history.</p>
      </header>

      <section className="compliance-dashboard__grid">
        <div>
          <h2>Financial periods</h2>
          <FinancialPeriodTable
            periods={periods}
            onClose={closePeriod}
            onReopen={reopenPeriod}
          />
        </div>

        <div>
          <h2>Audit history</h2>
          <ComplianceAuditTable entries={audit} />
        </div>
      </section>
    </main>
  )
}
