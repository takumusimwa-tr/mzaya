import { useState } from 'react'
import useOrderFinanceReconciliation from '../../hooks/useOrderFinanceReconciliation'
import OrderFinanceStatusCard from '../../components/finance/OrderFinanceStatusCard'
import OrderReconciliationTable from '../../components/finance/OrderReconciliationTable'
import '../../components/finance/orderFinance.css'

export default function OrderFinanceReconciliation() {
  const [orderType, setOrderType] = useState('')
  const {
    results,
    loading,
    reconcile,
  } = useOrderFinanceReconciliation(orderType)

  if (loading) {
    return <p className="order-finance-state">Loading order reconciliation…</p>
  }

  return (
    <main className="order-finance-page">
      <header>
        <div>
          <p className="finance-eyebrow">Finance operations</p>
          <h1>Order reconciliation</h1>
          <p>
            Completed orders, delivery completion, finance events, and ledger traceability.
          </p>
        </div>

        <select
          value={orderType}
          onChange={(event) => setOrderType(event.target.value)}
        >
          <option value="">All services</option>
          <option value="food">Food</option>
          <option value="grocery">Grocery</option>
          <option value="materials">Materials</option>
        </select>
      </header>

      <OrderFinanceStatusCard results={results} />

      <OrderReconciliationTable
        results={results}
        onReconcile={reconcile}
      />
    </main>
  )
}
