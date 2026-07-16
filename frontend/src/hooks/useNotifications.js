import { useEffect } from 'react'
import useAuthStore from '../store/useAuthStore'

export default function useNotifications(onNewOrder) {
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (!user || !('Notification' in window)) return

    // Request permission
    Notification.requestPermission()

    // Poll for new orders every 15 seconds (simple approach before WebSocket)
    if (user.role !== 'vendor' && user.role !== 'rider') return

    const interval = setInterval(() => {
      onNewOrder && onNewOrder()
    }, 15000)

    return () => clearInterval(interval)
    // onNewOrder is intentionally excluded — including it would tear down and
    // recreate the 15s interval on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])
}

export function sendNotification(title, body, onClick) {
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  const n = new Notification(title, {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
  })

  if (onClick) n.onclick = onClick
}
