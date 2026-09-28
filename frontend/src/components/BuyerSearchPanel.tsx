import { useState, type FormEvent } from 'react'
import { DATA_SOURCES } from '../services/api'
import type { BuyerSearchRequest } from '../types/buyer'
import { ALL_COUNTRIES, TARGET_MARKETS } from '../types/market'
import { findProduct, PRODUCTS } from '../types/product'
import Button from './Button'

const field = 'w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink'
const labelCls = 'mb-1.5 block text-[13px] font-medium text-muted'
const FOCUS = new Set(TARGET_MARKETS.map((m) => m.country))
const OTHER_COUNTRIES = ALL_COUNTRIES.filter((c) => !FOCUS.has(c))

interface Props {
  initial?: Partial<BuyerSearchRequest>
  submitting?: boolean
  onSubmit: (value: BuyerSearchRequest) => void
}

/** Product + Country + Source. The HS code comes from the product's verified code. */
export default function BuyerSearchPanel({ initial = {}, submitting = false, onSubmit }: Props) {
  const [product, setProduct] = useState(findProduct(initial.product)?.name ?? PRODUCTS[0].name)
  const [country, setCountry] = useState(initial.country ?? TARGET_MARKETS[0].country)
  const [source, setSource] = useState(DATA_SOURCES.some((s) => s.provider === initial.source) ? initial.source! : DATA_SOURCES[0].provider)

  const hsCode = findProduct(product)?.hsCode ?? null

  function submit(e: FormEvent) {
    e.preventDefault()
    onSubmit({ product, country, hsCode: hsCode ?? '', source })
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-line bg-surface p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
        <div>
          <label htmlFor="search-product" className={labelCls}>Product</label>
          <select id="search-product" className={field} value={product} onChange={(e) => setProduct(e.target.value)}>
            {PRODUCTS.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="search-country" className={labelCls}>Country</label>
          <select id="search-country" className={field} value={country} onChange={(e) => setCountry(e.target.value)}>
            <optgroup label="Focus markets">
              {TARGET_MARKETS.map((m) => <option key={m.country} value={m.country}>{m.country}</option>)}
            </optgroup>
            <optgroup label="All countries">
              {OTHER_COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </optgroup>
          </select>
        </div>

        <div>
          <label htmlFor="search-source" className={labelCls}>Source</label>
          <select id="search-source" className={field} value={source} onChange={(e) => setSource(e.target.value)}>
            {DATA_SOURCES.map((s) => <option key={s.provider} value={s.provider}>{s.displayName}</option>)}
          </select>
        </div>

        <Button type="submit" disabled={submitting} className="h-[38px] sm:col-span-3 lg:col-span-1">
          {submitting ? 'Searching…' : 'Search buyers'}
        </Button>
      </div>
      <p className="mt-3 text-[13px] text-faint">
        {hsCode ? <>HS code <span className="tabular text-muted">{hsCode}</span> (verified)</> : 'HS code not yet verified for this product.'}
      </p>
    </form>
  )
}
