import { useCallback, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Sidebar, { NavLinks, SourceLinks } from './Navigation'

/**
 * Top navigation. `overlay` sits transparently over the landing page's dark hero;
 * `solid` is used on the working pages.
 */
export default function Header({ variant = 'solid' }: { variant?: 'overlay' | 'solid' }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const frame = variant === 'overlay' ? 'absolute inset-x-0 top-0 z-30' : 'sticky top-0 z-30 border-b border-white/[0.06] bg-night'

  return (
    <header className={frame}>
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-6 px-5 sm:px-8 lg:px-12">
        <Link to="/" className="shrink-0 text-[13px] font-bold tracking-[0.14em] text-white">
          GLOBAL BUYER INTELLIGENCE
        </Link>

        <nav aria-label="Main" className="hidden flex-1 lg:block">
          <NavLinks layout="bar" />
        </nav>

        <div className="ml-auto hidden lg:block">
          <SourceLinks layout="bar" />
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="ml-auto rounded-md border border-white/15 px-3 py-1.5 text-sm text-white lg:hidden"
          aria-label="Open menu"
        >
          Menu
        </button>
      </div>
      {menuOpen && <Sidebar onClose={closeMenu} />}
    </header>
  )
}

/** Title block at the top of each working page. */
export function PageHeading({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[30px] font-bold leading-tight tracking-[-0.02em] text-ink">{title}</h1>
        <p className="mt-1.5 max-w-xl text-[15px] leading-relaxed text-muted">{description}</p>
      </div>
      {actions}
    </div>
  )
}
