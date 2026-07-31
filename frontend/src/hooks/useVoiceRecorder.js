import { useEffect, useRef, useState } from 'react'

export default function useVoiceRecorder() {
  const [status, setStatus] = useState('idle')
  const [durationMs, setDurationMs] = useState(0)
  const [blob, setBlob] = useState(null)
  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const startedAtRef = useRef(null)

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : undefined,
    })

    chunksRef.current = []
    setBlob(null)
    setDurationMs(0)

    recorder.ondataavailable = (event) => {
      if (event.data.size) chunksRef.current.push(event.data)
    }

    recorder.onstop = () => {
      const output = new Blob(chunksRef.current, {
        type: recorder.mimeType || 'audio/webm',
      })
      setBlob(output)
      stream.getTracks().forEach((track) => track.stop())
    }

    recorder.start(250)
    recorderRef.current = recorder
    startedAtRef.current = Date.now()
    timerRef.current = window.setInterval(() => {
      setDurationMs(Date.now() - startedAtRef.current)
    }, 100)
    setStatus('recording')
  }

  const stop = () => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop()
    }
    window.clearInterval(timerRef.current)
    setDurationMs(Date.now() - startedAtRef.current)
    setStatus('ready')
  }

  const reset = () => {
    setBlob(null)
    setDurationMs(0)
    setStatus('idle')
  }

  useEffect(() => () => {
    window.clearInterval(timerRef.current)
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop()
    }
  }, [])

  return {
    status,
    durationMs,
    blob,
    start,
    stop,
    reset,
  }
}
