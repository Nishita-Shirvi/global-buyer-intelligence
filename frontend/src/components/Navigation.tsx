import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { DATA_SOURCES } from '../services/api'

const NAV_LINKS = [
  { label: 'Dashboard', to: '/', end: true },
  { label: 'Buyer Discovery', to: '/buyers' },
  { label: 'Markets', to: '/markets' },
  { label: 'Products', to: '/products' },
  { label: 'Data Sources', to: '/data-sources' },
]

const EXTERNAL_SOURCES = DATA_SOURCES.filter((s) => s.url)

export function ExternalArrow({ className = 'size-3' }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={className} aria-hidden>
      <path d="M4 2.5h5.5V8M9.5 2.5 3 9" />
    </svg>
  )
}

/** App navigation, as a horizontal bar (desktop header) or a vertical list (drawer). */
export function NavLinks({ layout, onNavigate }: { layout: 'bar' | 'list'; onNavigate?: () => void }) {
  return (
    <ul className={layout === 'bar' ? 'flex items-center gap-1' : 'space-y-1'}>
      {NAV_LINKS.map((l) => (
        <li key={l.to}>
          <NavLink
            to={l.to}
            end={l.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              layout === 'bar'
                ? `relative block rounded-md px-3 py-1.5 text-sm transition-colors ${isActive ? 'text-white after:absolute after:inset-x-3 after:-bottom-[13px] after:h-px after:bg-glow' : 'text-white/55 hover:text-white'}`
                : `block rounded-md px-3 py-2.5 text-[15px] ${isActive ? 'bg-white/10 font-semibold text-white' : 'text-white/70'}`
            }
          >
            {l.label}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}

/** Links to the official ITC Trade Map and Volza websites, opened in a new tab. */
export function SourceLinks({ layout }: { layout: 'bar' | 'list' }) {
  return (
    <ul className={layout === 'bar' ? 'flex items-center gap-1' : 'space-y-1'}>
      {EXTERNAL_SOURCES.map((s) => (
        <li key={s.provider}>
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className={
              layout === 'bar'
                ? 'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-white/55 transition-colors hover:text-white'
                : 'flex items-center justify-between rounded-md px-3 py-2.5 text-[15px] text-white/70'
            }
          >
            {s.displayName}
            <ExternalArrow className={layout === 'bar' ? 'size-3' : 'size-3.5'} />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

/** Slide-in navigation for small screens. Desktop uses the top bar in Header. */
export default function Sidebar({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/60" onClick={onClose} />
      <nav className="absolute inset-y-0 right-0 flex w-72 max-w-[85%] flex-col bg-night px-5 py-5 text-white shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <span className="text-sm font-semibold">Menu</span>
          <button type="button" onClick={onClose} className="rounded-md border border-white/15 px-3 py-1 text-sm">Close</button>
        </div>
        <NavLinks layout="list" onNavigate={onClose} />
        <p className="mb-2 mt-8 px-3 text-xs text-white/40">Trade intelligence sources</p>
        <SourceLinks layout="list" />
      </nav>
    </div>
  )
}
