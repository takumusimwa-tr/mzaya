import {useCallback,useEffect,useState} from 'react'
import api from '../api/api'
export default function useRevenueRecognition(){const [schedules,setSchedules]=useState([]);const [loading,setLoading]=useState(true);const refresh=useCallback(async()=>{const {data}=await api.get('/revenue-recognition');setSchedules(data.schedules||[])},[]);useEffect(()=>{refresh().finally(()=>setLoading(false))},[refresh]);return{schedules,loading,refresh}}
