import useFinanceDataQuality from '../../hooks/useFinanceDataQuality'
import DataQualityScorecard from '../../components/finance/DataQualityScorecard'
import '../../components/finance/financeMasterData.css'

export default function FinanceDataQualityDashboard() {
  const { results, loading, runAssessment } = useFinanceDataQuality()
  if (loading) return <p className="finance-master-data-state">Loading finance data quality…</p>

  const issues = results.filter((item) => item.result === 'failed')
  return (
    <main className="finance-master-data-page">
      <header>
        <div>
          <p className="finance-eyebrow">Finance governance</p>
          <h1>Data quality</h1>
          <p>Validation coverage, configuration issues, and governance exceptions.</p>
        </div>
        <button className="master-data-primary-action" type="button" onClick={() => runAssessment(null)}>
          Run assessment
        </button>
      </header>
      <DataQualityScorecard results={results} />
      <section className="validation-issue-table">
        {issues.map((issue) => (
          <article key={issue.id}>
            <strong>{issue.issue_code || 'Validation issue'}</strong>
            <span>{issue.issue_message}</span>
            <span>{issue.evaluated_at}</span>
          </article>
        ))}
      </section>
    </main>
  )
}
