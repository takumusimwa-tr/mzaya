import useFinancePosting from '../../hooks/useFinancePosting'
import PostingRuleTable from '../../components/finance/PostingRuleTable'
import JournalBatchCard from '../../components/finance/JournalBatchCard'
import PostingFailurePanel from '../../components/finance/PostingFailurePanel'
import '../../components/finance/financeEventEngine.css'

export default function FinancePostingCenter() {
  const {
    rules,
    batches,
    failures,
    loading,
  } = useFinancePosting()

  if (loading) {
    return <p className="finance-event-state">Loading posting center…</p>
  }

  return (
    <main className="finance-event-page">
      <header>
        <div>
          <p className="finance-eyebrow">Accounting infrastructure</p>
          <h1>Posting center</h1>
          <p>Posting rules, journal batches, balancing, and exceptions.</p>
        </div>
      </header>

      <section className="finance-event-grid">
        <div>
          <h2>Posting rules</h2>
          <PostingRuleTable rules={rules} />
        </div>

        <PostingFailurePanel failures={failures} />
      </section>

      <section className="finance-journal-batch-grid">
        {batches.map((batch) => (
          <JournalBatchCard key={batch.id} batch={batch} />
        ))}
      </section>
    </main>
  )
}
