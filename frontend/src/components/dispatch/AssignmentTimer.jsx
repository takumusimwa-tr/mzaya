import { useCallback, useEffect, useState } from 'react'

export default function AssignmentTimer({ expiresAt, onExpire }) {
  const calculate = useCallback(
    () => Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000)),
    [expiresAt],
  )

  const [seconds, setSeconds] = useState(calculate)

  useEffect(() => {
    const timer = window.setInterval(() => {
      const next = calculate()
      setSeconds(next)
      if (next === 0) {
        window.clearInterval(timer)
        onExpire?.()
      }
    }, 250)

    return () => window.clearInterval(timer)
  }, [calculate, onExpire])

  return (
    <span aria-live="polite" className="font-semibold tabular-nums">
      {seconds}s
    </span>
  )
}
