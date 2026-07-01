// Resolves a stored image path to a full URL.
// Stored paths look like "/uploads/123.png" — prepend the API origin.
const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')

export default function imageUrl(url) {
  if (!url) return null
  if (url.startsWith('http') || url.startsWith('blob:')) return url
  return `${API_ORIGIN}${url}`
}
