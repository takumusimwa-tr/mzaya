import { useState, useRef } from 'react'
import api from '../api/api'
import Icon from './ui/Icon'

// Reusable image uploader. Calls onUploaded(url) when done.
export default function ImageUpload({ currentUrl, onUploaded, label = 'Upload image', shape = 'square' }) {
  const fileInput = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview]     = useState(currentUrl || null)
  const [error, setError]         = useState('')

  const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')

  const fullUrl = (url) => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `${API_ORIGIN}${url}`
  }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB')
      return
    }

    // Local preview immediately
    setPreview(URL.createObjectURL(file))
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('image', file)
      const { data } = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onUploaded(data.url)
      setPreview(fullUrl(data.url))
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed')
      setPreview(currentUrl ? fullUrl(currentUrl) : null)
    } finally {
      setUploading(false)
    }
  }

  const rounded = shape === 'circle' ? 'rounded-full' : 'rounded-2xl'

  return (
    <div>
      <input ref={fileInput} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      <button
        type="button"
        onClick={() => fileInput.current?.click()}
        disabled={uploading}
        className={`relative w-full aspect-video ${rounded} border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden active:scale-98 transition-transform`}
      >
        {preview ? (
          <>
            <img src={fullUrl(preview) || preview} alt="" className="w-full h-full object-cover" />
            {!uploading && (
              <div className="absolute inset-0 bg-black/0 hover:bg-black/20 flex items-center justify-center transition-colors">
                <span className="text-xs text-white bg-black/50 px-3 py-1.5 rounded-full opacity-0 hover:opacity-100">
                  Change
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="text-center">
            <div className="mb-1 flex justify-center text-gray-400"><Icon name="camera" size={28} /></div>
            <p className="text-xs text-gray-400 font-medium">{label}</p>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-3 border-gray-200 border-t-gray-600 animate-spin" />
          </div>
        )}
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
