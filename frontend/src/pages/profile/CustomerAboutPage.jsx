/**
 * Routed About Mzaya container.
 * Product copy is intentionally conservative; final visual branding remains
 * deferred to the dedicated branding phase.
 */
import { useNavigate } from 'react-router-dom'
import AboutMzayaPage from '../customer/AboutMzayaPage'

export default function CustomerAboutPage() {
  const navigate = useNavigate()

  return (
    <AboutMzayaPage
      version="1.0.0"
      onBack={() => navigate(-1)}
      onOpenSupport={() => navigate('/help')}
    />
  )
}
