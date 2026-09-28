import { useBuyers } from '../services/useResource'
import BuyerTable from './BuyerTable'

/** Latest stored buyer records from GET /api/buyers. */
export default function RecentBuyers() {
  const buyers = useBuyers({ page: 1, size: 6, sort: '-created_at' })

  // Shown only when real buyer records exist; otherwise it stays out of the way.
  if (buyers.status !== 'ready' || buyers.data.items.length === 0) return null

  return (
    <section className="rounded-lg border border-line bg-surface">
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">Recent buyers</h2>
          <p className="text-[13px] text-muted">Most recently added buyer records</p>
        </div>
      </div>
      <BuyerTable buyers={buyers.data.items} columns="compact" />
    </section>
  )
}
