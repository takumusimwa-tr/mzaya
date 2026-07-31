import { useState } from 'react'
import useSettlementBatches from '../../hooks/useSettlementBatches'
import SettlementBatchSummary from '../../components/finance/SettlementBatchSummary'
import '../../components/finance/settlements.css'

export default function SettlementOperations() {
  const [ownerType, setOwnerType] = useState('vendor')
  const [currency, setCurrency] = useState('USD')

  const {
    batch,
    loading,
    createBatch,
    approveBatch,
    submitBatch,
  } = useSettlementBatches()

  const create = () => createBatch({
    ownerType,
    currency,
    settlementDate: new Date().toISOString().slice(0, 10),
  })

  return (
    <main className="settlement-operations">
      <header>
        <div>
          <p className="finance-eyebrow">Finance operations</p>
          <h1>Settlements</h1>
          <p>
            Prepare and approve vendor and Mzaya payout batches.
          </p>
        </div>
      </header>

      <section className="settlement-operations__controls">
        <label>
          Recipient type
          <select
            value={ownerType}
            onChange={(event) => setOwnerType(event.target.value)}
          >
            <option value="vendor">Vendors</option>
            <option value="rider">Mzayas</option>
          </select>
        </label>

        <label>
          Currency
          <select
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
          >
            <option value="USD">USD</option>
            <option value="ZWL">ZWL</option>
          </select>
        </label>

        <button type="button" onClick={create} disabled={loading}>
          {loading ? 'Preparing…' : 'Create batch'}
        </button>
      </section>

      {batch && (
        <SettlementBatchSummary
          batch={batch}
          onApprove={approveBatch}
          onSubmit={submitBatch}
        />
      )}
    </main>
  )
}
