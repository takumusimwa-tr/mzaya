import useRevenueRecognition from '../../hooks/useRevenueRecognition'
import RevenueScheduleTable from '../../components/finance/RevenueScheduleTable'
import '../../components/finance/profitability.css'
export default function RevenueRecognitionDashboard(){const {schedules,loading}=useRevenueRecognition();if(loading)return <p className="profitability-state">Loading revenue schedules…</p>;return <main className="profitability-page"><header><div><p className="finance-eyebrow">Management accounting</p><h1>Revenue recognition</h1><p>Earned, deferred, and reversed revenue by completed obligation.</p></div></header><RevenueScheduleTable schedules={schedules}/></main>}
