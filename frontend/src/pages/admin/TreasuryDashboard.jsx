import { useState } from 'react'
import useTreasury from '../../hooks/useTreasury'
import TreasuryKPIs from '../../components/finance/TreasuryKPIs'
import BankAccountCard from '../../components/finance/BankAccountCard'
import '../../components/finance/treasury.css'

export default function TreasuryDashboard() {
  const [currency, setCurrency] = useState('USD')
  const {
    accounts,
    position,
    loading,
  } = useTreasury(currency)

  if (loading || !position) {
    return <p className="treasury-state">Loading treasury…</p>
  }

  const bankAccounts = accounts.flatMap(
    (account) => account.bankAccounts || []
  )

  return (
    <main className="treasury-page">
      <header>
        <div>
          <p className="finance-eyebrow">Treasury operations</p>
          <h1>Cash & liquidity</h1>
          <p>Bank balances, liquidity coverage, and pending outflows.</p>
        </div>

        <select
          value={currency}
          onChange={(event) => setCurrency(event.target.value)}
        >
          <option value="USD">USD</option>
          <option value="ZWL">ZWL</option>
        </select>
      </header>

      <TreasuryKPIs position={position} />

      <section className="treasury-bank-section">
        <h2>Bank accounts</h2>
        <div className="treasury-bank-grid">
          {bankAccounts.map((account) => (
            <BankAccountCard key={account.id} account={account} />
          ))}
        </div>
      </section>
    </main>
  )
}
