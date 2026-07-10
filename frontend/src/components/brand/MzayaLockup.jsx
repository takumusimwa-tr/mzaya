import MzayaIcon from './MzayaIcon'

const GREEN = '#00A651'

// The lowercase "mzaya" wordmark — used in app headers.
export function MzayaWordmark({ size = 'text-2xl', color = GREEN, className = '' }) {
  return (
    <span className={`font-black tracking-tight ${size} ${className}`} style={{ color }}>
      mzaya
    </span>
  )
}

// Icon + wordmark together, optionally with the "Tumai Mzaya." tagline.
// Used on splash / loading / marketing surfaces.
export function MzayaLockup({ iconSize = 64, stacked = true, tagline = true, onDark = false }) {
  const textColor = onDark ? '#FFFFFF' : GREEN
  const taglineColor = onDark ? 'rgba(255,255,255,0.75)' : '#15803D'

  if (stacked) {
    return (
      <div className="flex flex-col items-center gap-3">
        <MzayaIcon size={iconSize} bg={GREEN} />
        <div className="flex flex-col items-center">
          <MzayaWordmark size="text-3xl" color={textColor} />
          {tagline && (
            <span className="text-sm font-medium mt-0.5" style={{ color: taglineColor }}>
              Tumai Mzaya.
            </span>
          )}
        </div>
      </div>
    )
  }

  // Horizontal lockup
  return (
    <div className="flex items-center gap-2.5">
      <MzayaIcon size={iconSize} bg={GREEN} />
      <div className="flex flex-col leading-none">
        <MzayaWordmark size="text-2xl" color={textColor} />
        {tagline && (
          <span className="text-[11px] font-medium mt-0.5" style={{ color: taglineColor }}>
            Tumai Mzaya.
          </span>
        )}
      </div>
    </div>
  )
}

export default MzayaLockup
