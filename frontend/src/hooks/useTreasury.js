import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useTreasury(currency = 'USD') {
  const [accounts, setAccounts] = useState([])
  const [position, setPosition] = useState(null)
  const [snapshots, setSnapshots] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const [accountResponse, positionResponse, trendResponse] =
      await Promise.all([
        api.get('/treasury/accounts'),
        api.get('/treasury/liquidity', { params: { currency } }),
        api.get('/treasury/liquidity/trend', {
          params: { currency, limit: 60 },
        }),
      ])

    setAccounts(accountResponse.data.accounts || [])
    setPosition(positionResponse.data.position)
    setSnapshots(trendResponse.data.snapshots || [])
  }, [currency])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  return { accounts, position, snapshots, loading, refresh }
}
