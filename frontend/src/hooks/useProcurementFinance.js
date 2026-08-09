import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useProcurementFinance() {
  const [procurements, setProcurements] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get('/procurement-finance')
    setProcurements(data.procurements || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const approve = async (procurementId) => {
    await api.post(`/procurement-finance/${procurementId}/approve`)
    await refresh()
  }

  const complete = async (procurementId) => {
    await api.post(`/procurement-finance/${procurementId}/complete`)
    await refresh()
  }

  return {
    procurements,
    loading,
    refresh,
    approve,
    complete,
  }
}
