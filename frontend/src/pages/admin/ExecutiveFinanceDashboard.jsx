import { useMemo, useState } from 'react'
import useExecutiveFinance from '../../hooks/useExecutiveFinance'
import ExecutiveFinanceKPIs from '../../components/finance/ExecutiveFinanceKPIs'
import LiquidityRiskPanel from '../../components/finance/LiquidityRiskPanel'
import ProfitabilityLeaderboard from '../../components/finance/ProfitabilityLeaderboard'
import '../../components/finance/executiveFinance.css'

function currentMonthRange() {
  const now = new Date()
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  return {
    from: from.toISOString().slice(0, 10),
    to: now.toISOString().slice(0, 10),
  }
}

export default function ExecutiveFinanceDashboard() {
  const [currency, setCurrency] = useState('USD')
  const range = useMemo(currentMonthRange, [])
  const { summary, loading } = useExecutiveFinance({
    currency,
    from: range.from,
    to: range.to,
  })

  if (loading || !summary) {
    return <p className="executive-finance-state">Loading executive finance…</p>
  }

  return (
    <main className="executive-finance-page">
      <header>
        <div>
          <p className="finance-eyebrow">Executive finance</p>
          <h1>Finance overview</h1>
          <p>
            Revenue, margin, liquidity, planning, close readiness, and risk.
          </p>
        </div>

        <select
          value={currency}
          onChange={(event) => setCurrency(event.target.value)}
        >
          <option value="USD">USD</option>
          <option value="ZWL">ZWL</option>
        </select>
      </header>

      <ExecutiveFinanceKPIs
        totals={summary.totals}
        currency={currency}
      />

      <section className="executive-finance-grid">
        <LiquidityRiskPanel
          liquidity={summary.liquidity}
          alerts={summary.treasuryAlerts || []}
          currency={currency}
        />
        <ProfitabilityLeaderboard
          snapshots={summary.profitability || []}
        />
      </section>
    </main>
  )
}
