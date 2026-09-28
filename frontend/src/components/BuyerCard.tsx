import { Link } from 'react-router-dom'
import { ACTIVITY_LABEL, type Buyer } from '../types/buyer'
import { orNA } from '../services/format'
import Badge from './Badge'

/** Buyer row as a card, used on narrow screens instead of the table. */
export default function BuyerCard({ buyer }: { buyer: Buyer }) {
  return (
    <Link to={`/buyers/${buyer.id}`} className="block px-5 py-4 hover:bg-paper">
      <div className="flex items-start justify-between gap-3">
        <p className="font-semibold text-ink [overflow-wrap:anywhere]">{buyer.companyName}</p>
        {buyer.activityType && <Badge tone="harbor">{ACTIVITY_LABEL[buyer.activityType]}</Badge>}
      </div>
      <p className="mt-0.5 text-sm text-muted">{[buyer.city, buyer.country].filter(Boolean).join(', ')}</p>
      <dl className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1 text-[13px]">
        <dt className="text-faint">Product</dt>
        <dd className="text-ink">{orNA(buyer.product)}{buyer.hsCode && <span className="text-faint"> · HS {buyer.hsCode}</span>}</dd>
        <dt className="text-faint">Source</dt>
        <dd className="text-ink">{buyer.source}</dd>
      </dl>
    </Link>
  )
}
