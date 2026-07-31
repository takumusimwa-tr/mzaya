import { useEffect, useState } from 'react'
import api from '../api/api'

export default function usePushRegistration({
  enabled = true,
  getToken,
  platform = 'web',
}) {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled || typeof getToken !== 'function') return undefined

    let active = true

    async function register() {
      try {
        setStatus('requesting')

        const token = await getToken()
        if (!token || !active) return

        await api.post('/chat-push/devices', {
          platform,
          pushToken: token,
          deviceId: localStorage.getItem('mzaya_device_id'),
          locale: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        })

        if (active) setStatus('registered')
      } catch (requestError) {
        if (active) {
          setError(requestError)
          setStatus('failed')
        }
      }
    }

    register()

    return () => {
      active = false
    }
  }, [enabled, getToken, platform])

  return {
    status,
    error,
  }
}
