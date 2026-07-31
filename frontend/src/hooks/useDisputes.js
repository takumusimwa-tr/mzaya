import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useDisputes() {
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get('/disputes')
    setDisputes(data.disputes || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const update = async (disputeId, changes) => {
    await api.patch(`/disputes/${disputeId}`, changes)
    await refresh()
  }

  return {
    disputes,
    loading,
    refresh,
    update,
  }
}
