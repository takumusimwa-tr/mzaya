import useFinanceMasterData from '../../hooks/useFinanceMasterData'
import MasterDataDomainCard from '../../components/finance/MasterDataDomainCard'
import PeriodLockTable from '../../components/finance/PeriodLockTable'
import '../../components/finance/financeMasterData.css'

export default function FinanceMasterDataDashboard() {
  const { domains, records, periodLocks, loading } = useFinanceMasterData()
  if (loading) return <p className="finance-master-data-state">Loading finance master data…</p>

  return (
    <main className="finance-master-data-page">
      <header>
        <div>
          <p className="finance-eyebrow">Finance governance</p>
          <h1>Master data</h1>
          <p>Controlled financial configuration, effective dating, and period locks.</p>
        </div>
      </header>

      <section className="master-data-domain-grid">
        {domains.map((domain) => (
          <MasterDataDomainCard
            key={domain.id}
            domain={domain}
            recordCount={records.filter((r) => r.domain_id === domain.id).length}
          />
        ))}
      </section>

      <h2>Period locks</h2>
      <PeriodLockTable locks={periodLocks} />
    </main>
  )
}
