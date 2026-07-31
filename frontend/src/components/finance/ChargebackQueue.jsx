import useChargebacks from '../../hooks/useChargebacks'
import './refunds.css'

export default function ChargebackQueue() {
  const {
    chargebacks,
    loading,
    updateOutcome,
  } = useChargebacks()

  if (loading) {
    return <p className="finance-state">Loading chargebacks…</p>
  }

  return (
    <section className="chargeback-queue">
      <header>
        <p>Finance operations</p>
        <h1>Chargeback queue</h1>
      </header>

      {!chargebacks.length ? (
        <div className="finance-empty">
          <h2>No open chargebacks</h2>
          <p>Provider disputes will appear here.</p>
        </div>
      ) : (
        chargebacks.map((item) => (
          <article key={item.id}>
            <div>
              <strong>{item.provider_case_reference}</strong>
              <span>{item.provider} · {item.reason_code || 'No reason code'}</span>
            </div>

            <div>
              <strong>
                {item.currency} {(Number(item.amount_minor) / 100).toFixed(2)}
              </strong>
              <span>{item.status}</span>
            </div>

            <div>
              <button
                type="button"
                onClick={() => updateOutcome(item.id, 'won')}
              >
                Mark won
              </button>
              <button
                type="button"
                onClick={() => updateOutcome(item.id, 'lost')}
              >
                Mark lost
              </button>
            </div>
          </article>
        ))
      )}
    </section>
  )
}
