// Resolves a stored image path to a full URL.
//
// Two kinds of stored value:
//   - Cloudinary (production): an absolute https://res.cloudinary.com/... URL
//   - Local disk (dev):        a relative "/uploads/123.png" path
//
// For Cloudinary URLs we can request a resized/optimised variant on the fly by
// injecting a transformation into the path. This matters a lot on Zimbabwean
// mobile data: a list of 20 vendor cards should fetch 20 thumbnails, not 20
// full-size photos.
//
// Usage:
//   imageUrl(url)            → original (already optimised on upload)
//   imageUrl(url, 400)       → width-400 variant, auto format + quality
const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')

export default function imageUrl(url, width = null) {
  if (!url) return null
  if (url.startsWith('blob:')) return url

  // Cloudinary — inject a transformation segment after "/upload/".
  if (width && url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    const t = `f_auto,q_auto,w_${width},c_limit`
    return url.replace('/upload/', `/upload/${t}/`)
  }

  if (url.startsWith('http')) return url
  return `${API_ORIGIN}${url}`
}
