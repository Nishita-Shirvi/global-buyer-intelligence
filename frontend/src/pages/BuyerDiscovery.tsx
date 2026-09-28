import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import BuyerFilters, { type BuyerFilterValue } from '../components/BuyerFilters'
import BuyerTable from '../components/BuyerTable'
import RecentBuyers from '../components/RecentBuyers'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import Loader from '../components/Loader'
import { PageHeading } from '../components/Header'
import BuyerSearchPanel from '../components/BuyerSearchPanel'
import { toResourceError, type Resource } from '../services/useResource'
import { DATA_SOURCES, openExternal, searchBuyers, sourceSearchUrl } from '../services/api'
import { findMarket } from '../types/market'
import { ExternalArrow } from '../components/Navigation'
import type { Buyer, BuyerSearchRequest } from '../types/buyer'
import { formatCount } from '../services/format'

type SearchState = { status: 'idle' } | Resource<Buyer[]>

export default function BuyerDiscovery() {
  const [params] = useSearchParams()
  const initial: Partial<BuyerSearchRequest> = {
    product: params.get('product') ?? undefined,
    country: params.get('country') ?? undefined,
    source: params.get('source') ?? undefined,
  }

  const [state, setState] = useState<SearchState>({ status: 'idle' })
  const [last, setLast] = useState<BuyerSearchRequest | null>(null)
  const [filters, setFilters] = useState<BuyerFilterValue>({ city: '', source: '' })

  async function run(req: BuyerSearchRequest) {
    setLast(req)
    setFilters({ city: '', source: '' })
    setState({ status: 'loading' })
    try {
      setState({ status: 'ready', data: await searchBuyers(req) })
    } catch (err) {
      setState(toResourceError<Buyer[]>(err))
    }
  }

  const visible = useMemo(
    () => (state.status === 'ready' ? state.data.filter((b) => (!filters.city || b.city === filters.city) && (!filters.source || b.source === filters.source)) : []),
    [state, filters],
  )
  const sourceName = DATA_SOURCES.find((s) => s.provider === last?.source)?.displayName ?? last?.source

  function results() {
    switch (state.status) {
      case 'idle':
        return (
          <div className="space-y-6">
            <EmptyState title="Start a buyer search" description="Choose a product, country, and source, then select Search buyers." />
            <RecentBuyers />
          </div>
        )
      case 'loading':
        return <div className="rounded-lg border border-line bg-surface px-6 py-14 text-center"><Loader label={`Searching ${sourceName}`} /></div>
      case 'unavailable':
      case 'offline':
        return (
          <div className="space-y-4">
            <ErrorState
              title="Buyer discovery service is currently unavailable."
              message="Buyer data isn't connected to this platform yet, so no results are shown. Nothing is filled in with made-up buyers."
              onRetry={() => last && run(last)}
            />
            {last && <SourceHandoff request={last} />}
          </div>
        )
      case 'error':
        if (state.code === 'PROVIDER_NOT_CONFIGURED') {
          return <EmptyState title={`${sourceName} isn't configured`} description={`${state.message} Choose another data source to search.`} />
        }
        if (state.code === 'PROVIDER_UNAVAILABLE' || state.code === 'PROVIDER_TIMEOUT') {
          return <ErrorState title={`${sourceName} is unavailable`} message={state.message} onRetry={() => last && run(last)} />
        }
        return <ErrorState title="Search failed" message={state.message} onRetry={() => last && run(last)} />
      case 'ready':
        if (state.data.length === 0) {
          return <EmptyState title="No buyers found" description="Try another product, country, or source." />
        }
        return (
          <section className="rounded-lg border border-line bg-surface">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
              <p className="text-sm text-muted">
                <span className="tabular font-semibold text-ink">{formatCount(visible.length)}</span>
                {visible.length !== state.data.length && <> of {formatCount(state.data.length)}</>} buyers found
                {last && <> · {last.product}, {last.country}{last.hsCode && <>, HS {last.hsCode}</>}</>}
                <span className="block text-[13px] text-faint">Companies with documented import activity, not confirmed current demand.</span>
              </p>
              <BuyerFilters buyers={state.data} value={filters} onChange={setFilters} />
            </div>
            {visible.length > 0 ? (
              <BuyerTable
                buyers={visible}
                onBuyerUpdated={(u) => setState((s) => (s.status === 'ready' ? { ...s, data: s.data.map((b) => (b.id === u.id ? u : b)) } : s))}
              />
            ) : (
              <EmptyState variant="inline" title="No buyers match these filters" description="Clear the city or source filter to see all results." />
            )}
          </section>
        )
    }
  }

  return (
    <>
      <PageHeading title="Buyer Discovery" description="Find potential buyers for a product in any country, using real trade intelligence." />
      <div className="mb-6">
        <BuyerSearchPanel initial={initial} submitting={state.status === 'loading'} onSubmit={run} />
      </div>
      {results()}
    </>
  )
}

/** While buyer data isn't connected, send the user to the same search on the source's own website. */
function SourceHandoff({ request }: { request: BuyerSearchRequest }) {
  const source = DATA_SOURCES.find((s) => s.provider === request.source)
  if (!source) return null
  const url = sourceSearchUrl(source.provider, request.hsCode || null, findMarket(request.country)?.isoNumeric ?? null)
  const deep = url !== source.url
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-line bg-surface px-5 py-4">
      <div>
        <p className="text-sm font-semibold text-ink">Search on {source.displayName} instead</p>
        <p className="mt-0.5 text-[13px] text-muted">
          {deep
            ? `Opens ${source.displayName}'s importing companies for ${request.product} (HS ${request.hsCode}) in ${request.country}.`
            : `Opens ${source.displayName}'s website. Search for ${request.product} buyers in ${request.country} there.`}
        </p>
      </div>
      <button type="button" onClick={() => openExternal(url)} className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-1.5 text-sm font-medium text-ink hover:bg-paper">
        Open {source.displayName} <ExternalArrow />
      </button>
    </div>
  )
}
