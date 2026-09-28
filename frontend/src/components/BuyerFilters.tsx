import type { Buyer } from '../types/buyer'

export interface BuyerFilterValue {
  city: string
  source: string
}

/** Narrows the current result set by city and source. Options come from the results themselves. */
export default function BuyerFilters({ buyers, value, onChange }: { buyers: Buyer[]; value: BuyerFilterValue; onChange: (v: BuyerFilterValue) => void }) {
  const cities = [...new Set(buyers.map((b) => b.city).filter((c): c is string => !!c))].sort()
  const sources = [...new Set(buyers.map((b) => b.source))].sort()
  const select = 'rounded-md border border-line bg-surface py-1.5 pl-2.5 pr-8 text-sm'

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor="filter-city">City</label>
      <select id="filter-city" className={select} value={value.city} onChange={(e) => onChange({ ...value, city: e.target.value })} disabled={cities.length === 0}>
        <option value="">All cities</option>
        {cities.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <label className="sr-only" htmlFor="filter-source">Source</label>
      <select id="filter-source" className={select} value={value.source} onChange={(e) => onChange({ ...value, source: e.target.value })}>
        <option value="">All sources</option>
        {sources.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  )
}
