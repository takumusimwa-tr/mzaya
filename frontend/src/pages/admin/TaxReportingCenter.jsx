import useTaxReporting from '../../hooks/useTaxReporting'
import TaxRegistrationTable from '../../components/finance/TaxRegistrationTable'
import TaxFilingCalendar from '../../components/finance/TaxFilingCalendar'
import TaxReturnTable from '../../components/finance/TaxReturnTable'
import '../../components/finance/taxReporting.css'

export default function TaxReportingCenter() {
  const {
    registrations,
    periods,
    returns,
    loading,
    approveReturn,
    submitReturn,
  } = useTaxReporting()

  if (loading) {
    return <p className="tax-reporting-state">Loading tax reporting…</p>
  }

  return (
    <main className="tax-reporting-center">
      <header>
        <p className="finance-eyebrow">Statutory reporting</p>
        <h1>Tax reporting</h1>
        <p>
          Registrations, filing deadlines, return preparation, approval, and submission.
        </p>
      </header>

      <section className="tax-reporting-grid">
        <div>
          <h2>Registrations</h2>
          <TaxRegistrationTable registrations={registrations} />
        </div>

        <div>
          <h2>Filing calendar</h2>
          <TaxFilingCalendar periods={periods} />
        </div>
      </section>

      <section className="tax-reporting-returns">
        <h2>Tax returns</h2>
        <TaxReturnTable
          returns={returns}
          onApprove={approveReturn}
          onSubmit={submitReturn}
        />
      </section>
    </main>
  )
}
