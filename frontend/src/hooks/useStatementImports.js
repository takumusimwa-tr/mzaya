import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'
import socket from '../realtime/socket'

export default function useStatementImports() {
  const [imports, setImports] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get('/bank-statement-imports')
    setImports(data.imports || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
    socket.on('treasury:statement_import_completed', refresh)

    return () => {
      socket.off('treasury:statement_import_completed', refresh)
    }
  }, [refresh])

  const createImport = async (payload) => {
    const { data } = await api.post('/bank-statement-imports', payload)
    await refresh()
    return data.statementImport
  }

  return {
    imports,
    loading,
    refresh,
    createImport,
  }
}
