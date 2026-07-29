import lockupPrimary from '../../assets/brand/logos/mzaya-lockup-horizontal-primary.svg'
import lockupWhite from '../../assets/brand/logos/mzaya-lockup-horizontal-white.svg'
import wordmarkPrimary from '../../assets/brand/logos/mzaya-wordmark-primary.svg'
import wordmarkWhite from '../../assets/brand/logos/mzaya-wordmark-white.svg'
import markGreen from '../../assets/brand/logos/mzaya-mark-green.svg'
import markWhite from '../../assets/brand/logos/mzaya-mark-white.svg'

export function MzayaWordmark({ color, className = '', onDark = false }) {
  const src = onDark || color === '#FFFFFF' ? wordmarkWhite : wordmarkPrimary
  return <img src={src} alt="Mzaya" className={`h-7 w-auto ${className}`} />
}

export function MzayaLockup({ iconSize = 64, stacked = false, tagline = true, onDark = false, className = '' }) {
  if (stacked) {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <img src={onDark ? markWhite : markGreen} alt="" aria-hidden="true" style={{ width: iconSize, height: iconSize }} />
        <img src={onDark ? wordmarkWhite : wordmarkPrimary} alt="Mzaya" className="h-10 w-auto mt-2" />
        {tagline && <span className={`text-sm font-semibold mt-1 ${onDark ? 'text-white/80' : 'text-green-700'}`}>Tumai Mzaya.</span>}
      </div>
    )
  }
  return <img src={onDark ? lockupWhite : lockupPrimary} alt="Mzaya — Tumai Mzaya" className={`w-auto ${className}`} style={{ height: Math.max(iconSize, 42) }} />
}

export default MzayaLockup
