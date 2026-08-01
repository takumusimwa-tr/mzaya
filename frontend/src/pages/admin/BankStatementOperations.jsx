import useStatementImports from '../../hooks/useStatementImports'
import StatementImportCard from '../../components/finance/StatementImportCard'
import '../../components/finance/bankStatements.css'

export default function BankStatementOperations() {
  const {
    imports,
    loading,
  } = useStatementImports()

  if (loading) {
    return <p className="bank-statements-state">Loading statement imports…</p>
  }

  return (
    <main className="bank-statements-page">
      <header>
        <p className="finance-eyebrow">Treasury operations</p>
        <h1>Bank statements</h1>
        <p>
          Import history, transaction normalization, and reconciliation readiness.
        </p>
      </header>

      <section className="bank-statements-grid">
        {imports.map((item) => (
          <StatementImportCard key={item.id} item={item} />
        ))}
      </section>
    </main>
  )
}
