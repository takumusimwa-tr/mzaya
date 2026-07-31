export default function ServiceCard({
  label,
  description,
  icon: Icon,
  active = false,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="group min-h-[116px] rounded-[22px] border p-4 text-left outline-none transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-[var(--mzaya-primary)] focus-visible:ring-offset-2"
      style={{
        background: active ? 'var(--mzaya-green-800)' : 'var(--mzaya-surface)',
        borderColor: active ? 'var(--mzaya-green-800)' : 'var(--mzaya-border)',
        boxShadow: active
          ? '0 14px 30px rgba(11, 74, 63, 0.18)'
          : '0 8px 24px rgba(18, 23, 20, 0.045)',
      }}
    >
      <span
        aria-hidden="true"
        className="flex h-10 w-10 items-center justify-center rounded-[14px] transition-transform duration-200 group-active:scale-95"
        style={{
          background: active ? 'rgba(255,255,255,0.14)' : 'var(--mzaya-surface-muted)',
          color: active ? 'var(--mzaya-text-inverse)' : 'var(--mzaya-green-800)',
        }}
      >
        <Icon size={20} strokeWidth={1.8} />
      </span>

      <span
        className="mt-4 block text-[15px] font-semibold tracking-[-0.01em]"
        style={{ color: active ? 'var(--mzaya-text-inverse)' : 'var(--mzaya-text-primary)' }}
      >
        {label}
      </span>

      <span
        className="mt-0.5 block text-[12px] leading-[18px]"
        style={{ color: active ? 'rgba(255,255,255,0.70)' : 'var(--mzaya-text-muted)' }}
      >
        {description}
      </span>
    </button>
  )
}
