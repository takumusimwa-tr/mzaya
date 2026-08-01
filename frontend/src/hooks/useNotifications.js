import { useCallback, useEffect, useMemo, useState } from 'react'
import api from '../api/api'
import useSocket from './useSocket'

// Fire a browser notification if the user has granted permission; ask once if
// they haven't decided; no-op (silently) when denied or unsupported. `onClick`
// focuses the app and runs the callback — used to deep-link into the order.
export function sendNotification(title, body, onClick) {
  if (typeof Notification === 'undefined') return
  const show = () => {
    const n = new Notification(title, { body, icon: '/brand/app-icons/mzaya-app-icon-192.png' })
    if (onClick) n.onclick = () => { window.focus(); onClick(); n.close() }
  }
  if (Notification.permission === 'granted') show()
  else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((p) => { if (p === 'granted') show() })
  }
}

export default function useNotifications({ token, initialLimit = 20 }) {
  const { socket, connected, connectionError } = useSocket(token)
  const [notifications, setNotifications] = useState([])
  const [nextCursor, setNextCursor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async ({ cursor, append = false } = {}) => {
    setError(null)
    try {
      const { data } = await api.get('/notifications', {
        params: {
          limit: initialLimit,
          cursor,
        },
      })
      setNotifications((current) =>
        append
          ? [...current, ...(data.notifications || [])]
          : data.notifications || []
      )
      setNextCursor(data.nextCursor || null)
    } catch (requestError) {
      setError(requestError)
      throw requestError
    } finally {
      setLoading(false)
    }
  }, [initialLimit])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!socket) return undefined

    const onNew = (notification) => {
      setNotifications((current) => [
        notification,
        ...current.filter((item) => item.id !== notification.id),
      ])
    }
    const onRead = ({ notificationId, readAt }) => {
      setNotifications((current) =>
        current.map((item) =>
          item.id === notificationId
            ? { ...item, read_at: readAt }
            : item
        )
      )
    }
    const onReadAll = ({ readAt }) => {
      setNotifications((current) =>
        current.map((item) => ({ ...item, read_at: item.read_at || readAt }))
      )
    }
    const onArchived = ({ notificationId }) => {
      setNotifications((current) =>
        current.filter((item) => item.id !== notificationId)
      )
    }

    socket.on('notification:new', onNew)
    socket.on('notification:read', onRead)
    socket.on('notification:read_all', onReadAll)
    socket.on('notification:archived', onArchived)

    return () => {
      socket.off('notification:new', onNew)
      socket.off('notification:read', onRead)
      socket.off('notification:read_all', onReadAll)
      socket.off('notification:archived', onArchived)
    }
  }, [socket])

  const markRead = useCallback(async (notificationId) => {
    const { data } = await api.patch(
      `/notifications/${notificationId}/read`
    )
    setNotifications((current) =>
      current.map((item) =>
        item.id === notificationId ? data.notification : item
      )
    )
    return data.notification
  }, [])

  const markAllRead = useCallback(async () => {
    const { data } = await api.patch('/notifications/read-all')
    setNotifications((current) =>
      current.map((item) => ({
        ...item,
        read_at: item.read_at || data.readAt,
      }))
    )
    return data
  }, [])

  const archive = useCallback(async (notificationId) => {
    await api.delete(`/notifications/${notificationId}`)
    setNotifications((current) =>
      current.filter((item) => item.id !== notificationId)
    )
  }, [])

  return useMemo(() => ({
    notifications,
    unreadCount: notifications.filter((item) => !item.read_at).length,
    loading,
    error,
    connected,
    connectionError,
    hasMore: Boolean(nextCursor),
    loadMore: () => nextCursor
      ? load({ cursor: nextCursor, append: true })
      : Promise.resolve(),
    markRead,
    markAllRead,
    archive,
    refresh: () => load(),
  }), [
    notifications,
    loading,
    error,
    connected,
    connectionError,
    nextCursor,
    load,
    markRead,
    markAllRead,
    archive,
  ])
}
