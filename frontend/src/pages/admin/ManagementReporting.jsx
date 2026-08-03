import useReportingPacks from '../../hooks/useReportingPacks'
import ReportingPackCard from '../../components/finance/ReportingPackCard'
import '../../components/finance/executiveFinance.css'

export default function ManagementReporting() {
  const {
    packs,
    loading,
  } = useReportingPacks()

  if (loading) {
    return <p className="executive-finance-state">Loading reporting packs…</p>
  }

  return (
    <main className="executive-finance-page">
      <header>
        <div>
          <p className="finance-eyebrow">Management reporting</p>
          <h1>Reporting packs</h1>
          <p>Management, board, weekly, and investor finance packs.</p>
        </div>
      </header>

      <section className="reporting-pack-grid">
        {packs.map((pack) => (
          <ReportingPackCard key={pack.id} pack={pack} />
        ))}
      </section>
    </main>
  )
}
