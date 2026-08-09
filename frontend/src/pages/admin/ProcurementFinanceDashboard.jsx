import useProcurementFinance from '../../hooks/useProcurementFinance'
import ProcurementFinanceTable from '../../components/finance/ProcurementFinanceTable'
import '../../components/finance/procurementFinance.css'

export default function ProcurementFinanceDashboard() {
  const {
    procurements,
    loading,
    approve,
    complete,
  } = useProcurementFinance()

  if (loading) {
    return <p className="procurement-finance-state">Loading procurement finance…</p>
  }

  return (
    <main className="procurement-finance-page">
      <header>
        <div>
          <p className="finance-eyebrow">Procurement finance</p>
          <h1>Procurement</h1>
          <p>
            Authorized funds, sourcing spend, procurement fees, refunds, and finance traceability.
          </p>
        </div>
      </header>

      <ProcurementFinanceTable
        procurements={procurements}
        onApprove={approve}
        onComplete={complete}
      />
    </main>
  )
}
