import usePaymentFinanceReconciliation from '../../hooks/usePaymentFinanceReconciliation'
import PaymentFinanceStatusCard from '../../components/finance/PaymentFinanceStatusCard'
import PaymentReconciliationTable from '../../components/finance/PaymentReconciliationTable'
import '../../components/finance/paymentFinance.css'

export default function PaymentFinanceReconciliation() {
  const {
    results,
    loading,
    reconcile,
  } = usePaymentFinanceReconciliation()

  if (loading) {
    return <p className="payment-finance-state">Loading payment reconciliation…</p>
  }

  return (
    <main className="payment-finance-page">
      <header>
        <div>
          <p className="finance-eyebrow">Finance operations</p>
          <h1>Payment reconciliation</h1>
          <p>
            Payment capture, outbox delivery, accounting events, and ledger traceability.
          </p>
        </div>
      </header>

      <PaymentFinanceStatusCard results={results} />

      <PaymentReconciliationTable
        results={results}
        onReconcile={reconcile}
      />
    </main>
  )
}
