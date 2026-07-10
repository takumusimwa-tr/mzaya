// Mzaya brand icon: an "M" with a running courier carrying a package.
// Inline SVG so it scales crisply everywhere (favicon → splash) and is themeable.
// Swap for a designer asset later by replacing this file's SVG only.
export default function MzayaIcon({ size = 48, color = '#00A651', bg = null, rounded = true }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {bg && (
        <rect width="100" height="100" rx={rounded ? 22 : 0} fill={bg} />
      )}
      {/* The M uprights + valley, drawn as bold strokes */}
      <g fill={bg ? '#FFFFFF' : color}>
        {/* left leg of M */}
        <path d="M20 78 V26 h9 l0 52 z" />
        {/* right leg of M */}
        <path d="M71 78 V26 h9 l0 52 z" />
        {/* M inner diagonals (the valley) — subtle, behind the runner */}
        <path d="M29 27 l11 20 -7 4 -11 -20 z" opacity="0.9" />
        <path d="M71 27 l-11 20 7 4 11 -20 z" opacity="0.9" />
      </g>

      {/* Running courier figure, centered in the M */}
      <g fill={bg ? '#FFFFFF' : color}>
        {/* head */}
        <circle cx="52" cy="34" r="6.5" />
        {/* torso + leading arm */}
        <path d="M46 42
                 q6 -3 12 1
                 l8 5 -4 6 -7 -4
                 q-4 -1 -7 2 z" />
        {/* back leg (extended) */}
        <path d="M40 66 l10 -12 5 4 -9 14 z" />
        {/* front leg (driving forward) */}
        <path d="M52 55 l9 8 -5 6 -11 -9 z" />
      </g>

      {/* Package in the courier's leading hand */}
      <g>
        <rect x="63" y="44" width="13" height="13" rx="2.5" fill={bg ? '#FFFFFF' : color} />
        <path d="M69.5 44 v13 M63 50.5 h13" stroke={bg || '#00A651'} strokeWidth="1.6" />
      </g>
    </svg>
  )
}
