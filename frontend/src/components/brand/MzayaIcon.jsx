import symbolPrimary from '../../assets/brand/logos/mzaya-symbol-primary.svg'
import symbolWhite from '../../assets/brand/logos/mzaya-symbol-white.svg'

/** Official Mzaya symbol, exported from the approved Figma vector master. */
export default function MzayaIcon({ size = 48, color, bg = null, className = '', ...props }) {
  const onDark = color?.toLowerCase() === '#ffffff' || color?.toLowerCase() === 'white'
  return (
    <img
      src={onDark ? symbolWhite : symbolPrimary}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={className}
      style={bg ? { background: bg } : undefined}
      {...props}
    />
  )
}
