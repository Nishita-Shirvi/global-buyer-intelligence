import { ButtonLink } from '../components/Button'
import MarketOverview from '../components/MarketOverview'
import StatCard from '../components/StatCard'
import { PageHeading } from '../components/Header'
import { useResource } from '../services/useResource'
import { getDashboardStats, openExternal, sourceSearchUrl } from '../services/api'
import { ExternalArrow } from '../components/Navigation'
import { TARGET_MARKETS } from '../types/market'
import { formatCount } from '../services/format'

/**
 * Target markets come from configuration, so this page renders without the backend.
 * Buyer counts are requested quietly and appear only when real records exist.
 */
export default function Markets() {
  const stats = useResource((s) => getDashboardStats(s), 'dashboard-stats')
  const data = stats.status === 'ready' && stats.data.totalBuyers > 0 ? stats.data : null
  const countFor = (country: string) => (data ? data.buyersByMarket.find((m) => m.country === country)?.count ?? 0 : null)

  return (
    <>
      <PageHeading
        title="Markets"
        description="Focus markets for the initial research. The platform itself is global: Buyer Discovery searches any country. Buyer counts appear once real buyer records exist, and show where identified importers are concentrated, not consumption."
      />

      {data && (
        <>
          <div className="mb-6 grid grid-cols-1 divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <StatCard label="Total buyers" value={data.totalBuyers} caption="Companies identified from connected sources" />
            <StatCard label="Markets covered" value={data.marketsCovered} caption="Countries with at least one buyer" />
            <StatCard label="Active importers" value={data.activeImporters} caption="Importers with confirmed recent activity" />
          </div>
          <section className="mb-6 rounded-lg border border-line bg-surface">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-[15px] font-semibold text-ink">Buyer activity by market</h2>
              <p className="text-[13px] text-muted">Identified buyers per market, highest concentration first</p>
            </div>
            <MarketOverview markets={data.buyersByMarket} />
          </section>
        </>
      )}

      <div className="overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-line bg-paper/60 text-[13px] text-muted">
            <tr>
              <th className="px-5 py-2.5 text-left font-medium">Market</th>
              <th className="px-5 py-2.5 text-left font-medium">Region</th>
              <th className="px-5 py-2.5 text-right font-medium">Identified buyers</th>
              <th className="px-5 py-2.5"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {TARGET_MARKETS.map((m) => {
              const n = countFor(m.country)
              return (
                <tr key={m.country}>
                  <td className="px-5 py-3.5 font-medium text-ink">{m.country}</td>
                  <td className="px-5 py-3.5 text-muted">{m.region}</td>
                  <td className="tabular px-5 py-3.5 text-right">
                    {n === null ? <span className="text-faint">No data yet</span> : <span className="font-semibold text-ink">{formatCount(n)}</span>}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => openExternal(sourceSearchUrl('ITC', '0901', m.isoNumeric))}
                      title={`ITC Trade Map: coffee (HS 0901) importing companies in ${m.country}`}
                      className="mr-1 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium text-muted hover:bg-sunken hover:text-ink"
                    >
                      Coffee importers on ITC <ExternalArrow />
                    </button>
                    <ButtonLink variant="ghost" to={`/buyers?country=${encodeURIComponent(m.country)}`}>View buyers →</ButtonLink>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
