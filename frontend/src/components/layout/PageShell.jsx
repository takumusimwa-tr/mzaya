export default function PageShell({
  children,
  className = '',
  contentClassName = '',
  bottomInset = true,
  background = 'var(--mzaya-background)',
}) {
  return (
    <div
      className={`min-h-screen ${className}`}
      style={{ background }}
    >
      <main
        className={[
          'mx-auto w-full max-w-3xl px-4 pt-5',
          bottomInset ? 'pb-28' : 'pb-8',
          contentClassName,
        ].join(' ')}
      >
        {children}
      </main>
    </div>
  )
}
