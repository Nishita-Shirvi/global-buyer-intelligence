import { useState } from 'react'
import Button from './Button'

interface ErrorStateProps {
  title: string
  message: string
  onRetry?: () => void
  /** Technical detail, hidden behind a toggle. */
  details?: string
  variant?: 'panel' | 'banner'
}

export default function ErrorState({ title, message, onRetry, details, variant = 'panel' }: ErrorStateProps) {
  const [open, setOpen] = useState(false)

  if (variant === 'banner') {
    return (
      <div role="alert" className="border-b border-fail/20 bg-fail/[0.06] px-4 py-2.5 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="font-semibold text-fail">{title}</span>
          <span className="text-ink">{message}</span>
          <span className="ml-auto flex items-center gap-1">
            {details && (
              <Button variant="ghost" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
                {open ? 'Hide details' : 'Details'}
              </Button>
            )}
            {onRetry && <Button variant="secondary" onClick={onRetry}>Retry</Button>}
          </span>
          {open && details && <p className="w-full pb-1 text-xs text-muted">{details}</p>}
        </div>
      </div>
    )
  }

  return (
    <div role="alert" className="rounded-lg border border-fail/25 bg-surface px-6 py-10 text-center">
      <p className="text-[15px] font-semibold text-fail">{title}</p>
      <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted">{message}</p>
      <div className="mt-5 flex justify-center gap-2">
        {onRetry && <Button variant="secondary" onClick={onRetry}>Retry</Button>}
        {details && (
          <Button variant="ghost" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
            {open ? 'Hide details' : 'Details'}
          </Button>
        )}
      </div>
      {open && details && <p className="mx-auto mt-3 max-w-md text-xs text-muted">{details}</p>}
    </div>
  )
}
