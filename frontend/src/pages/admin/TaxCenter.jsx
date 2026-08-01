import { useEffect, useState } from 'react'
import useTaxCenter from '../../hooks/useTaxCenter'
import TaxRateTable from '../../components/finance/TaxRateTable'
import '../../components/finance/taxCompliance.css'

export default function TaxCenter() {
  const {
    jurisdictions,
    loading,
    loadRates,
  } = useTaxCenter()

  const [selectedId, setSelectedId] = useState('')
  const [rates, setRates] = useState([])

  useEffect(() => {
    if (!selectedId && jurisdictions[0]) {
      setSelectedId(jurisdictions[0].id)
    }
  }, [jurisdictions, selectedId])

  useEffect(() => {
    if (selectedId) loadRates(selectedId).then(setRates)
  }, [selectedId, loadRates])

  if (loading) {
    return <p className="tax-compliance-state">Loading tax center…</p>
  }

  return (
    <main className="tax-center">
      <header>
        <p className="finance-eyebrow">Financial governance</p>
        <h1>Tax center</h1>
        <p>Jurisdictions, effective tax rates, and reporting readiness.</p>
      </header>

      <section className="tax-center__controls">
        <label>
          Jurisdiction
          <select
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
          >
            {jurisdictions.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
      </section>

      <TaxRateTable rates={rates} />
    </main>
  )
}
