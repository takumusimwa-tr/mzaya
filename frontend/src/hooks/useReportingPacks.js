import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useReportingPacks() {
  const [packs, setPacks] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get('/finance-reporting-packs')
    setPacks(data.packs || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const generatePack = async (payload) => {
    const { data } = await api.post('/finance-reporting-packs', payload)
    await refresh()
    return data.pack
  }

  return {
    packs,
    loading,
    refresh,
    generatePack,
  }
}
