import lockupPrimary from '../../assets/brand/logos/mzaya-lockup-horizontal-primary.svg'
import lockupWhite from '../../assets/brand/logos/mzaya-lockup-horizontal-white.svg'
import stackedPrimary from '../../assets/brand/logos/mzaya-lockup-stacked-primary.svg'
import stackedWhite from '../../assets/brand/logos/mzaya-lockup-stacked-white.svg'
import wordmarkPrimary from '../../assets/brand/logos/mzaya-wordmark-primary.svg'
import wordmarkWhite from '../../assets/brand/logos/mzaya-wordmark-white.svg'

export function MzayaWordmark({ color, className = '', onDark = false }) {
  const isWhite = onDark || color?.toLowerCase() === '#ffffff'
  return <img src={isWhite ? wordmarkWhite : wordmarkPrimary} alt="Mzaya" className={`h-7 w-auto ${className}`} />
}

/** The approved lockups already contain the vector lettering; never overlay a font substitute. */
export function MzayaLockup({ iconSize = 64, stacked = false, tagline = true, onDark = false, className = '' }) {
  const src = stacked
    ? (onDark ? stackedWhite : stackedPrimary)
    : (onDark ? lockupWhite : lockupPrimary)
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <img src={src} alt="Mzaya" className="w-auto max-w-full" style={{ height: stacked ? Math.max(iconSize * 2.3, 90) : Math.max(iconSize, 42) }} />
      {tagline && <span className="mt-1 text-sm font-medium" style={{ color: onDark ? '#FFFFFF' : 'var(--mzaya-green-950)' }}>Tumai Mzaya.</span>}
    </div>
  )
}

export default MzayaLockup
