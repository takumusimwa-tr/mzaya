import MzayaIcon from '../brand/MzayaIcon'

export default function LoadingScreen({
  message = 'Getting Mzaya ready',
}) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-8"
      style={{ background: 'var(--mzaya-background)' }}
      role="status"
      aria-live="polite"
    >
      <div
        className="flex h-20 w-20 items-center justify-center rounded-[24px] border bg-white"
        style={{
          borderColor: 'var(--mzaya-border)',
          boxShadow: 'var(--mzaya-shadow-md)',
        }}
      >
        <MzayaIcon size={54} bg="var(--mzaya-primary)" />
      </div>

      <p
        className="mt-5 text-[14px] font-medium"
        style={{ color: 'var(--mzaya-text-secondary)' }}
      >
        {message}
      </p>

      <div
        className="mt-4 h-1 w-28 overflow-hidden rounded-full"
        style={{ background: 'var(--mzaya-primary-soft)' }}
        aria-hidden="true"
      >
        <span
          className="block h-full w-1/2 rounded-full animate-[mzaya-loading_1.1s_ease-in-out_infinite]"
          style={{ background: 'var(--mzaya-primary)' }}
        />
      </div>
    </div>
  )
}
