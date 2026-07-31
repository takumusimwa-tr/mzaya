import { useEffect, useState } from 'react'
import api from '../../api/api'
import NotificationSettings from '../../components/notifications/NotificationSettings'
import '../../components/notifications/notifications.css'

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    api.get('/notification-preferences')
      .then(({ data }) => setPreferences(data.preferences || {}))
      .finally(() => setLoading(false))
  }, [])

  const updatePreference = (category, channel, enabled) => {
    setPreferences((current) => ({
      ...current,
      [category]: {
        ...current[category],
        [channel]: enabled,
      },
    }))
  }

  const save = async () => {
    setSaving(true)
    setMessage('')

    try {
      const { data } = await api.put('/notification-preferences', {
        preferences,
      })
      setPreferences(data.preferences || preferences)
      setMessage('Preferences saved')
    } catch {
      setMessage('Unable to save preferences')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="notification-preferences-page">Loading…</div>
  }

  return (
    <main className="notification-preferences-page">
      <header>
        <span>Settings</span>
        <h1>Notification preferences</h1>
        <p>Choose how Mzaya keeps you informed.</p>
      </header>

      <NotificationSettings
        preferences={preferences}
        onChange={updatePreference}
        disabled={saving}
      />

      <div className="notification-preferences-page__actions">
        {message && <p role="status">{message}</p>}
        <button type="button" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save preferences'}
        </button>
      </div>
    </main>
  )
}
