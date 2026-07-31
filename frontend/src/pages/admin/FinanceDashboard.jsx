import { useMemo, useState } from 'react'
import useFinanceDashboard from '../../hooks/useFinanceDashboard'
import FinanceKPICards from '../../components/finance/FinanceKPICards'
import RevenueChart from '../../components/finance/RevenueChart'
import CashflowChart from '../../components/finance/CashflowChart'
import FinanceFilters from '../../components/finance/FinanceFilters'
import FinanceExportDialog from '../../components/finance/FinanceExportDialog'
import '../../components/finance/financeDashboard.css'

export default function FinanceDashboard() {
  const initialFilters = useMemo(() => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 29)

    return {
      currency: 'USD',
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
    }
  }, [])

  const [filters, setFilters] = useState(initialFilters)
  const [exportOpen, setExportOpen] = useState(false)

  const {
    dashboard,
    loading,
    error,
    refresh,
  } = useFinanceDashboard(filters)

  if (loading) {
    return <p className="finance-dashboard-state">Loading finance dashboard…</p>
  }

  if (error || !dashboard) {
    return (
      <p className="finance-dashboard-state">
        Finance data is currently unavailable.
      </p>
    )
  }

  return (
    <main className="finance-dashboard-page">
      <header className="finance-dashboard-page__header">
        <div>
          <p className="finance-eyebrow">Executive finance</p>
          <h1>Financial health</h1>
          <p>
            Revenue, cash movement, settlements, refunds, and reconciliation.
          </p>
        </div>

        <button type="button" onClick={() => setExportOpen(true)}>
          Export report
        </button>
      </header>

      <FinanceFilters
        filters={filters}
        onChange={setFilters}
        onRefresh={refresh}
      />

      <FinanceKPICards
        metrics={dashboard.metrics}
        profitability={dashboard.profitability}
        cashflow={dashboard.cashflow}
      />

      <section className="finance-dashboard-grid">
        <RevenueChart
          rows={dashboard.trend}
          currency={dashboard.metrics.currency}
        />
        <CashflowChart rows={dashboard.trend} />
      </section>

      <FinanceExportDialog
        open={exportOpen}
        filters={filters}
        onClose={() => setExportOpen(false)}
      />
    </main>
  )
}
