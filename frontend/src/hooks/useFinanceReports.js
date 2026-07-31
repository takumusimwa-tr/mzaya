import { useState } from 'react'
import api from '../api/api'

export default function useFinanceReports() {
  const [creating, setCreating] = useState(false)

  const createExport = async (payload) => {
    setCreating(true)

    try {
      const { data } = await api.post(
        '/finance-reports/exports',
        payload
      )
      return data.job
    } finally {
      setCreating(false)
    }
  }

  const getExport = async (jobId) => {
    const { data } = await api.get(
      `/finance-reports/exports/${jobId}`
    )
    return data.job
  }

  return {
    creating,
    createExport,
    getExport,
  }
}
