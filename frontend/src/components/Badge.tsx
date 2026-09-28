import type { ReactNode } from 'react'

export type BadgeTone = 'neutral' | 'ok' | 'fail' | 'signal' | 'harbor' | 'onDark'

const tones: Record<BadgeTone, string> = {
  neutral: 'border-line bg-surface text-muted',
  ok: 'border-ok/25 bg-ok/10 text-ok',
  fail: 'border-fail/25 bg-fail/10 text-fail',
  signal: 'border-stamp/35 bg-stamp/10 text-stamp-ink',
  harbor: 'border-harbor/20 bg-harbor/5 text-harbor',
  onDark: 'border-paper/20 text-paper/60',
}

export default function Badge({ tone = 'neutral', dot = false, children }: { tone?: BadgeTone; dot?: boolean; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded border px-1.5 py-px text-xs font-medium ${tones[tone]}`}>
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  )
}
