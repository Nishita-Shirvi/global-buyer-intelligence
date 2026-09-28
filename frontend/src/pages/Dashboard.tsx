import { lazy, Suspense, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { GlobeHover } from '../components/Globe'
import Header from '../components/Header'
import { ExternalArrow } from '../components/Navigation'
import { getDashboardStats, openExternal, sourceSearchUrl } from '../services/api'
import { formatCount } from '../services/format'
import { useBuyers, useResource } from '../services/useResource'
import { ACTIVITY_LABEL } from '../types/buyer'
import { findMarket, TARGET_MARKETS } from '../types/market'
import { PRODUCTS } from '../types/product'

// three.js (~250 kB gzipped) downloads with the globe only, after the page text is on screen.
const Globe = lazy(() => import('../components/Globe'))

function GlobeFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center" aria-hidden>
      <div className="aspect-square w-[62%] rounded-full bg-[radial-gradient(circle_at_35%_35%,#1b3a52_0%,#0b1a24_55%,transparent_72%)] opacity-70" />
    </div>
  )
}

const coord = (v: number, pos: string, neg: string) => `${Math.abs(v).toFixed(1)}° ${v >= 0 ? pos : neg}`

function Figure({ label, value, caption }: { label: string; value: ReactNode; caption: string }) {
  return (
    <div className="min-w-0 border-l border-white/10 pl-4 first:border-l-0 first:pl-0">
      <p className="text-[13px] text-white/50">{label}</p>
      <p className="tabular mt-1 text-[34px] font-bold leading-none tracking-[-0.02em] text-white">{value}</p>
      <p className="mt-1.5 text-xs leading-snug text-white/40">{caption}</p>
    </div>
  )
}

/** Opens when a market marker is clicked. Counts only when real records exist. */
function MarketPanel({ country, buyers, onClose }: { country: string; buyers: number | null; onClose: () => void }) {
  const market = findMarket(country)
  if (!market) return null
  return (
    <div className="absolute left-5 top-6 z-20 w-[min(20rem,calc(100%-2.5rem))] rounded-lg border border-white/12 bg-night-raised/90 p-5 backdrop-blur-md sm:left-8 lg:left-auto lg:right-[16vw] lg:top-24">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-white/45">{market.region} · focus market</p>
          <h2 className="mt-0.5 text-xl font-bold text-white">{market.country}</h2>
        </div>
        <button type="button" onClick={onClose} className="-mr-1 rounded px-1.5 text-lg leading-none text-white/50 hover:text-white" aria-label="Close market panel">×</button>
      </div>
      <dl className="mt-4 space-y-1.5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-white/50">Buyers</dt>
          <dd className="tabular text-white">{buyers === null ? <span className="text-white/40">No data yet</span> : formatCount(buyers)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-white/50">Products</dt>
          <dd className="text-right text-white">{PRODUCTS.map((p) => p.name).join(', ')}</dd>
        </div>
      </dl>
      <div className="mt-5 flex flex-col gap-2">
        <Link to={`/buyers?country=${encodeURIComponent(market.country)}`} className="rounded-md bg-glow px-4 py-2 text-center text-sm font-bold text-night hover:bg-[#f0bd5c]">
          View buyers →
        </Link>
        <button
          type="button"
          onClick={() => openExternal(sourceSearchUrl('ITC', '0901', market.isoNumeric))}
          className="inline-flex items-center justify-center gap-1.5 rounded-md border border-white/15 px-4 py-2 text-sm text-white/80 hover:border-white/40 hover:text-white"
        >
          Coffee importers on ITC Trade Map <ExternalArrow />
        </button>
      </div>
    </div>
  )
}

function RecentBuyersDark() {
  const buyers = useBuyers({ page: 1, size: 6, sort: '-created_at' })
  const rows = buyers.status === 'ready' ? buyers.data.items : []

  return (
    <section aria-labelledby="recent-heading" className="rounded-lg border border-white/10 bg-white/[0.03]">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
        <div>
          <h2 id="recent-heading" className="text-[15px] font-semibold text-white">Recent buyers</h2>
          <p className="text-[13px] text-white/45">Most recently added buyer records</p>
        </div>
        {rows.length > 0 && <Link to="/buyers" className="text-sm text-white/60 hover:text-white">View all</Link>}
      </div>
      {buyers.status === 'loading' ? (
        <div className="space-y-3 px-5 py-6">{[0, 1, 2].map((i) => <span key={i} className="block h-4 animate-pulse rounded bg-white/[0.06]" />)}</div>
      ) : rows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="text-left text-[13px] text-white/45">
              <tr>
                <th className="px-5 py-2.5 font-medium">Company</th>
                <th className="px-5 py-2.5 font-medium">Country</th>
                <th className="px-5 py-2.5 font-medium">Product</th>
                <th className="px-5 py-2.5 font-medium">Activity</th>
                <th className="px-5 py-2.5 font-medium">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.07]">
              {rows.map((b) => (
                <tr key={b.id} className="hover:bg-white/[0.03]">
                  <td className="px-5 py-3 font-medium text-white"><Link to={`/buyers/${b.id}`} className="hover:underline">{b.companyName}</Link></td>
                  <td className="px-5 py-3 text-white/75">{b.country}</td>
                  <td className="px-5 py-3 text-white/75">{b.product ?? <span className="text-white/35">N/A</span>}</td>
                  <td className="px-5 py-3 text-white/75">{b.activityType ? ACTIVITY_LABEL[b.activityType] : <span className="text-white/35">N/A</span>}</td>
                  <td className="px-5 py-3 text-[13px] text-white/50">{b.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-6 py-12 text-center">
          <p className="text-[15px] font-semibold text-white">No buyers yet</p>
          <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-white/50">
            Buyer records appear here once a data source is connected. Until then, search ITC Trade Map or Volza directly from Buyer Discovery or Data Sources.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link to="/buyers" className="rounded-md bg-glow px-4 py-2 text-sm font-bold text-night hover:bg-[#f0bd5c]">Search buyers</Link>
            <Link to="/data-sources" className="rounded-md border border-white/15 px-4 py-2 text-sm text-white/80 hover:border-white/40">Data sources</Link>
          </div>
        </div>
      )}
    </section>
  )
}

/**
 * Dashboard. Renders fully without the backend. Markets and products are configuration
 * and are counted as such; buyer figures appear only when real records exist.
 */
export default function Dashboard() {
  const [hover, setHover] = useState<GlobeHover | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const stats = useResource((s) => getDashboardStats(s), 'dashboard-stats')
  const data = stats.status === 'ready' ? stats.data : null
  const buyersIn = (country: string) => (data ? data.buyersByMarket.find((m) => m.country === country)?.count ?? 0 : null)

  return (
    <div className="relative min-h-svh overflow-hidden bg-night text-white">
      <Header variant="overlay" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_72%_32%,rgba(40,90,140,0.22),transparent_55%)]" />

      <div className="relative mx-auto grid max-w-[1440px] grid-cols-1 px-5 pt-24 sm:px-8 lg:min-h-svh lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:px-12 lg:pt-16">
        <section className="relative z-10 lg:self-center">
          <h1 className="text-[clamp(2.7rem,5.4vw,5rem)] font-bold leading-[0.9] tracking-[-0.035em]">
            GLOBAL
            <br />
            BUYER
            <br />
            INTELLIGENCE
          </h1>
          <p className="mt-7 max-w-md text-lg leading-snug text-white/80">
            Discover potential buyers for coffee, confectionery, and more, in markets around the world.
          </p>

          <div className="mt-9 grid max-w-md grid-cols-3 gap-4">
            <Figure label="Buyers" value={data ? formatCount(data.totalBuyers) : <span className="text-white/35">–</span>} caption={data ? 'Stored buyer records' : 'No buyer data connected yet'} />
            <Figure label="Markets" value={TARGET_MARKETS.length} caption="Focus markets" />
            <Figure label="Products" value={PRODUCTS.length} caption={PRODUCTS.map((p) => p.name).join(', ')} />
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link to="/buyers" className="rounded-md bg-glow px-5 py-3 text-sm font-bold tracking-[0.06em] text-night transition-colors hover:bg-[#f0bd5c]">
              SEARCH BUYERS →
            </Link>
            <Link to="/markets" className="rounded-md border border-white/20 px-5 py-3 text-sm font-bold tracking-[0.06em] text-white transition-colors hover:border-white/50">
              EXPLORE MARKETS
            </Link>
          </div>
        </section>

        <div className="relative -mx-5 h-[min(112vw,600px)] sm:-mx-8 lg:col-start-2 lg:row-start-1 lg:-mr-[12vw] lg:ml-0 lg:h-auto lg:min-h-[calc(100svh-4rem)]">
          <p className="pointer-events-none absolute left-5 top-0 z-10 text-xs tracking-[0.16em] text-white/40 sm:left-8 lg:left-auto lg:right-[16vw] lg:top-10">GLOBAL BUYER MAP</p>
          <Suspense fallback={<GlobeFallback />}>
            <Globe onHover={setHover} onSelect={setSelected} selected={selected} />
          </Suspense>
          {selected && <MarketPanel country={selected} buyers={buyersIn(selected)} onClose={() => setSelected(null)} />}
          <div className="pointer-events-none absolute bottom-5 right-5 z-10 text-right text-xs text-white/45 sm:bottom-8 sm:right-8 lg:right-[14vw]">
            <p className="tabular text-[13px] text-white/80" aria-live="polite">
              {hover ? (
                <>
                  {hover.label && <span className="mr-2 font-semibold text-white">{hover.label}</span>}
                  {coord(hover.lat, 'N', 'S')}, {coord(hover.lon, 'E', 'W')}
                </>
              ) : (
                'Drag to rotate · click a market'
              )}
            </p>
            <p className="mt-2 flex items-center justify-end gap-4">
              <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-glow" />Focus markets</span>
              <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-[#7fd1b9]" />India, origin</span>
            </p>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-[1440px] px-5 pb-16 sm:px-8 lg:px-12">
        <RecentBuyersDark />
      </div>
    </div>
  )
}
