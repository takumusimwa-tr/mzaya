import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'
import socket from '../realtime/socket'

export default function useTaxReporting() {
  const [registrations, setRegistrations] = useState([])
  const [periods, setPeriods] = useState([])
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const [registrationResponse, periodResponse, returnResponse] =
      await Promise.all([
        api.get('/tax-reporting/registrations'),
        api.get('/tax-reporting/filing-periods'),
        api.get('/tax-reporting/returns'),
      ])

    setRegistrations(registrationResponse.data.registrations || [])
    setPeriods(periodResponse.data.periods || [])
    setReturns(returnResponse.data.returns || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
    socket.on('tax_return:submitted', refresh)
    socket.on('tax_filing:due', refresh)

    return () => {
      socket.off('tax_return:submitted', refresh)
      socket.off('tax_filing:due', refresh)
    }
  }, [refresh])

  const prepareReturn = async (payload) => {
    await api.post('/tax-reporting/returns', payload)
    await refresh()
  }

  const approveReturn = async (taxReturnId) => {
    await api.patch(`/tax-reporting/returns/${taxReturnId}/approve`)
    await refresh()
  }

  const submitReturn = async (taxReturnId, submissionReference) => {
    await api.patch(`/tax-reporting/returns/${taxReturnId}/submit`, {
      submissionReference,
    })
    await refresh()
  }

  return {
    registrations,
    periods,
    returns,
    loading,
    refresh,
    prepareReturn,
    approveReturn,
    submitReturn,
  }
}
