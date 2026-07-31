import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useInvoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get('/invoices')
    setInvoices(data.invoices || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const createInvoice = async (payload) => {
    const { data } = await api.post('/invoices', payload)
    await refresh()
    return data.invoice
  }

  return {
    invoices,
    loading,
    refresh,
    createInvoice,
  }
}
