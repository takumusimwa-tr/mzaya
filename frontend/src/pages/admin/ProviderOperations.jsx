import { useState } from 'react'
import ProviderWebhookQueue from '../../components/finance/ProviderWebhookQueue'
import ReconciliationRunHistory from '../../components/finance/ReconciliationRunHistory'
import '../../components/finance/providerWebhooks.css'

export default function ProviderOperations() {
  const [status, setStatus] = useState('')

  return (
    <main className="provider-operations">
      <header>
        <div>
          <p className="finance-eyebrow">Finance infrastructure</p>
          <h1>Provider operations</h1>
          <p>
            Webhook processing, retries, dead letters, and automated reconciliation.
          </p>
        </div>
      </header>

      <section className="provider-operations__filters">
        <label>
          Webhook status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All</option>
            <option value="received">Received</option>
            <option value="processing">Processing</option>
            <option value="processed">Processed</option>
            <option value="failed">Failed</option>
            <option value="dead_letter">Dead letter</option>
          </select>
        </label>
      </section>

      <div className="provider-operations__grid">
        <ProviderWebhookQueue
          filters={status ? { status } : {}}
        />
        <ReconciliationRunHistory />
      </div>
    </main>
  )
}
