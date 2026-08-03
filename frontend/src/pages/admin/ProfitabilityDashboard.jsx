import {useState} from 'react'
import useProfitability from '../../hooks/useProfitability'
import UnitEconomicsKPIs from '../../components/finance/UnitEconomicsKPIs'
import ProfitabilityBreakdown from '../../components/finance/ProfitabilityBreakdown'
import '../../components/finance/profitability.css'
export default function ProfitabilityDashboard(){const [currency,setCurrency]=useState('USD');const {orders,snapshots,loading}=useProfitability(currency);if(loading)return <p className="profitability-state">Loading profitability…</p>;return <main className="profitability-page"><header><div><p className="finance-eyebrow">Management accounting</p><h1>Profitability</h1><p>Order economics, contribution margin, and business-unit performance.</p></div><select value={currency} onChange={e=>setCurrency(e.target.value)}><option value="USD">USD</option><option value="ZWL">ZWL</option></select></header><UnitEconomicsKPIs orders={orders} currency={currency}/><section><h2>Profitability by dimension</h2><ProfitabilityBreakdown snapshots={snapshots}/></section></main>}
