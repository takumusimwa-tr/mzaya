import useVarianceReports from '../../hooks/useVarianceReports'
import VarianceTable from '../../components/finance/VarianceTable'
import '../../components/finance/budgeting.css'

export default function VarianceDashboard() {
  const {
    reports,
    loading,
  } = useVarianceReports()

  if (loading) {
    return <p className="budgeting-state">Loading variance reports…</p>
  }

  return (
    <main className="budgeting-page">
      <header>
        <p className="finance-eyebrow">Financial planning</p>
        <h1>Variance analysis</h1>
        <p>
          Actual versus budget and forecast performance.
        </p>
      </header>

      <VarianceTable reports={reports} />
    </main>
  )
}
