import markGreen from '../../assets/brand/logos/mzaya-mark-green.svg'
import markWhite from '../../assets/brand/logos/mzaya-mark-white.svg'
import symbolPrimary from '../../assets/brand/logos/mzaya-symbol-primary.svg'

export default function MzayaIcon({ size = 48, color = '#00A651', bg = null, className = '' }) {
  const src = bg ? symbolPrimary : color === '#FFFFFF' ? markWhite : markGreen
  return <img src={src} alt="" aria-hidden="true" width={size} height={size} className={className} />
}
