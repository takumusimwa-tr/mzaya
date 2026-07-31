import useInvoices from '../../hooks/useInvoices'
import '../../components/finance/taxCompliance.css'

export default function InvoiceManagement() {
  const { invoices, loading } = useInvoices()

  if (loading) {
    return <p className="tax-compliance-state">Loading invoices…</p>
  }

  return (
    <main className="invoice-management">
      <header>
        <p className="finance-eyebrow">Financial governance</p>
        <h1>Invoices</h1>
      </header>

      <div className="invoice-management__list">
        {invoices.map((invoice) => (
          <article key={invoice.id}>
            <div>
              <strong>{invoice.invoice_number}</strong>
              <span>{invoice.document_type.replaceAll('_', ' ')}</span>
            </div>
            <strong>
              {invoice.currency} {(Number(invoice.total_minor) / 100).toFixed(2)}
            </strong>
            <span>{invoice.status}</span>
          </article>
        ))}
      </div>
    </main>
  )
}
