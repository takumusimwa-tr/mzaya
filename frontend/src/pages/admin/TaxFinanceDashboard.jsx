import useTaxFinance from '../../hooks/useTaxFinance'
import TaxTransactionTable from '../../components/finance/TaxTransactionTable'
import TaxLiabilityTable from '../../components/finance/TaxLiabilityTable'
import '../../components/finance/taxFinance.css'

export default function TaxFinanceDashboard() {
  const {
    transactions,
    liabilities,
    loading,
  } = useTaxFinance()

  if (loading) {
    return <p className="tax-finance-state">Loading tax finance…</p>
  }

  return (
    <main className="tax-finance-page">
      <header>
        <div>
          <p className="finance-eyebrow">Tax</p>
          <h1>Tax control center</h1>
          <p>
            Tax facts, liabilities, remittances, and accounting traceability.
          </p>
        </div>
      </header>

      <h2>Tax transactions</h2>
      <TaxTransactionTable transactions={transactions} />

      <h2>Tax liabilities</h2>
      <TaxLiabilityTable liabilities={liabilities} />
    </main>
  )
}
