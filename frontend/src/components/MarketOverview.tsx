import { formatCount } from '../services/format'

interface MarketOverviewProps {
  markets: { country: string; count: number }[]
}

/**
 * Buyer activity by market, ranked. Doubles as "top markets": one visual, no
 * duplicated numbers. Only markets with at least one stored buyer appear.
 */
export default function MarketOverview({ markets }: MarketOverviewProps) {
  const rows = markets.filter((m) => m.count > 0).sort((a, b) => b.count - a.count)
  const max = rows[0]?.count ?? 0
  const total = rows.reduce((sum, m) => sum + m.count, 0)

  if (rows.length === 0) {
    return <p className="px-5 py-10 text-center text-sm text-muted">No market has stored buyers yet.</p>
  }

  return (
    <ol className="divide-y divide-line">
      {rows.map((m, i) => (
        <li key={m.country} className="grid grid-cols-[1.5rem_minmax(0,9rem)_1fr_auto] items-center gap-3 px-5 py-3 sm:gap-4">
          <span className="tabular text-[13px] text-faint">{i + 1}</span>
          <span className="truncate text-sm font-medium text-ink">{m.country}</span>
          <span className="h-2 overflow-hidden rounded-full bg-sunken" aria-hidden>
            <span className="block h-full rounded-full bg-harbor" style={{ width: `${Math.max(2, (m.count / max) * 100)}%` }} />
          </span>
          <span className="tabular text-right text-sm">
            <span className="font-semibold text-ink">{formatCount(m.count)}</span>
            <span className="ml-2 inline-block w-10 text-faint">{Math.round((m.count / total) * 100)}%</span>
          </span>
        </li>
      ))}
    </ol>
  )
}
