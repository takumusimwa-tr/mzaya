import { useState } from 'react'
import api from '../api/api'

export default function useSettlementProfile() {
  const [saving, setSaving] = useState(false)

  const saveProfile = async (payload) => {
    setSaving(true)

    try {
      const { data } = await api.put('/settlements/profiles', payload)
      return data.profile
    } finally {
      setSaving(false)
    }
  }

  return {
    saving,
    saveProfile,
  }
}
