import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description: string
  action?: ReactNode
  /** 'panel' fills a section; 'inline' sits inside a card. */
  variant?: 'panel' | 'inline'
}

export default function EmptyState({ title, description, action, variant = 'panel' }: EmptyStateProps) {
  const frame = variant === 'panel' ? 'rounded-lg border border-line bg-surface px-6 py-14' : 'px-5 py-10'
  return (
    <div className={`${frame} text-center`}>
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted">{description}</p>
      {action && <div className="mt-5 flex justify-center gap-2">{action}</div>}
    </div>
  )
}
