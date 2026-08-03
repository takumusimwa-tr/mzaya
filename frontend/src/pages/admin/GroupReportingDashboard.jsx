import useGroupReports from '../../hooks/useGroupReports'
import GroupReportCard from '../../components/finance/GroupReportCard'
import '../../components/finance/consolidation.css'

export default function GroupReportingDashboard() {
  const {
    reports,
    loading,
  } = useGroupReports()

  if (loading) {
    return <p className="consolidation-state">Loading group reports…</p>
  }

  return (
    <main className="consolidation-page">
      <header>
        <p className="finance-eyebrow">Group finance</p>
        <h1>Group reporting</h1>
        <p>Consolidated financial statements and management views.</p>
      </header>

      <section className="group-report-grid">
        {reports.map((report) => (
          <GroupReportCard key={report.id} report={report} />
        ))}
      </section>
    </main>
  )
}
