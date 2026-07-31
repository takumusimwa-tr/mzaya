import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'
import socket from '../realtime/socket'

export default function useModerationQueue(filters = { status: 'open' }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data } = await api.get('/moderation/reports', { params: filters })
    setReports(data.reports || [])
  }, [filters])

  useEffect(() => {
    load().finally(() => setLoading(false))
    socket.on('moderation:report_created', load)
    socket.on('moderation:report_resolved', load)
    return () => {
      socket.off('moderation:report_created', load)
      socket.off('moderation:report_resolved', load)
    }
  }, [load])

  const resolve = async (reportId, payload) => {
    await api.patch(`/moderation/reports/${reportId}`, payload)
    await load()
  }

  return { reports, loading, resolve, refresh: load }
}
