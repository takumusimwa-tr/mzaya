import { AlertCircle } from 'lucide-react'

export default function ErrorMessage({
  message = 'Something went wrong',
  title,
  className = '',
  compact = false,
}) {
  return (
    <div
      role="alert"
      className={[
        'flex items-start gap-3 rounded-[18px] border',
        compact ? 'px-3.5 py-3' : 'px-4 py-4',
        className,
      ].join(' ')}
      style={{
        background: 'var(--mzaya-error-soft)',
        borderColor: 'rgba(180, 35, 24, 0.14)',
      }}
    >
      <AlertCircle
        aria-hidden="true"
        className="mt-0.5 flex-shrink-0"
        size={18}
        strokeWidth={1.8}
        style={{ color: 'var(--mzaya-error)' }}
      />

      <div className="min-w-0">
        {title && (
          <p
            className="text-[13px] font-semibold"
            style={{ color: 'var(--mzaya-error)' }}
          >
            {title}
          </p>
        )}

        <p
          className={`${title ? 'mt-0.5' : ''} text-[13px] leading-5`}
          style={{ color: 'var(--mzaya-error)' }}
        >
          {message}
        </p>
      </div>
    </div>
  )
}
