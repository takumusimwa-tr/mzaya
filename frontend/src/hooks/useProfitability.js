import {useCallback,useEffect,useState} from 'react'
import api from '../api/api'
export default function useProfitability(currency='USD'){const [orders,setOrders]=useState([]);const [snapshots,setSnapshots]=useState([]);const [loading,setLoading]=useState(true);const refresh=useCallback(async()=>{const {data}=await api.get('/profitability/dashboard',{params:{currency}});setOrders(data.orders||[]);setSnapshots(data.snapshots||[])},[currency]);useEffect(()=>{refresh().finally(()=>setLoading(false))},[refresh]);return{orders,snapshots,loading,refresh}}
