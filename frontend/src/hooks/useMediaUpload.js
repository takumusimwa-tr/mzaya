import { useCallback, useRef, useState } from 'react'
import api from '../api/api'

export default function useMediaUpload() {
  const [uploads, setUploads] = useState([])
  const controllers = useRef(new Map())

  const patchUpload = useCallback((id, changes) => {
    setUploads((current) =>
      current.map((item) => item.id === id ? { ...item, ...changes } : item)
    )
  }, [])

  const upload = useCallback(async ({
    file,
    conversationId,
    caption = '',
    durationMs = null,
    waveform = null,
  }) => {
    const localId = crypto.randomUUID()
    const controller = new AbortController()
    controllers.current.set(localId, controller)

    setUploads((current) => [
      ...current,
      {
        id: localId,
        file,
        progress: 0,
        status: 'creating',
      },
    ])

    try {
      const { data } = await api.post('/attachments/uploads', {
        conversationId,
        filename: file.name,
        mimeType: file.type,
        byteSize: file.size,
      })

      patchUpload(localId, {
        sessionId: data.session.id,
        status: 'uploading',
      })

      await api.put(data.upload.url, file, {
        signal: controller.signal,
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        onUploadProgress: (event) => {
          const total = event.total || file.size
          patchUpload(localId, {
            progress: Math.round((event.loaded / total) * 100),
          })
        },
      })

      patchUpload(localId, { status: 'finalizing', progress: 100 })

      const response = await api.post(
        `/attachments/uploads/${data.session.id}/finalize`,
        {
          clientMessageId: crypto.randomUUID(),
          caption,
          durationMs,
          waveform,
        }
      )

      patchUpload(localId, {
        status: 'complete',
        message: response.data.message,
      })

      return response.data.message
    } catch (error) {
      patchUpload(localId, {
        status: error.name === 'CanceledError' ? 'cancelled' : 'failed',
        error: error.message,
      })
      throw error
    } finally {
      controllers.current.delete(localId)
    }
  }, [patchUpload])

  const cancel = useCallback((id) => {
    controllers.current.get(id)?.abort()
  }, [])

  const dismiss = useCallback((id) => {
    setUploads((current) => current.filter((item) => item.id !== id))
  }, [])

  return {
    uploads,
    upload,
    cancel,
    dismiss,
  }
}
