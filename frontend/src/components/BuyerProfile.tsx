import { useState, type ReactNode } from 'react'
import { useBuyer } from '../services/useResource'
import { enrichBuyer, isEndpointMissing } from '../services/api'
import { ACTIVITY_LABEL, type Buyer } from '../types/buyer'
import { formatDate, toHref } from '../services/format'
import Badge from './Badge'
import Button, { ButtonLink } from './Button'
import EmptyState from './EmptyState'
import ErrorState from './ErrorState'
import { Skeleton } from './Loader'

const NA = <span className="text-faint">Not available</span>
const val = (v: string | null | undefined) => (v && v.trim() ? v : NA)

function Section({ title, children, note }: { title: string; children: ReactNode; note?: string }) {
  return (
    <section className="rounded-lg border border-line bg-surface">
      <h2 className="border-b border-line px-5 py-3.5 text-[15px] font-semibold text-ink">{title}</h2>
      <dl className="divide-y divide-line">{children}</dl>
      {note && <p className="border-t border-line px-5 py-3 text-[13px] leading-relaxed text-faint">{note}</p>}
    </section>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,9rem)_1fr] gap-4 px-5 py-3 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="text-ink [overflow-wrap:anywhere]">{children}</dd>
    </div>
  )
}

function Profile({ initial }: { initial: Buyer }) {
  const [buyer, setBuyer] = useState(initial)
  const [enrich, setEnrich] = useState<{ state: 'idle' | 'running' | 'done' } | { state: 'error'; message: string }>({ state: 'idle' })

  async function runEnrich() {
    setEnrich({ state: 'running' })
    try {
      setBuyer(await enrichBuyer(buyer.id))
      setEnrich({ state: 'done' })
    } catch (err) {
      setEnrich({
        state: 'error',
        message: isEndpointMissing(err) ? "Website enrichment isn't available yet." : (err as Error).message,
      })
    }
  }

  const location = [buyer.city, buyer.country].filter(Boolean).join(', ')
  const enrichmentLabel = { SUCCESS: 'Enriched', FAILED: 'Enrichment failed', NOT_ENRICHED: 'Not enriched' } as const

  return (
    <>
      <div className="mb-6 rounded-lg border border-line bg-surface px-5 py-6 sm:px-7">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0">
            <p className="text-[13px] text-muted">Potential buyer</p>
            <h1 className="mt-1 text-[28px] font-bold leading-tight tracking-[-0.02em] text-ink [overflow-wrap:anywhere]">{buyer.companyName}</h1>
            <p className="mt-1 text-[15px] text-muted">{location || 'Location not available'}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {buyer.activityType && <Badge tone="harbor">{ACTIVITY_LABEL[buyer.activityType]}</Badge>}
              <Badge>Source: {buyer.source}</Badge>
              {buyer.enrichmentStatus && (
                <Badge tone={buyer.enrichmentStatus === 'SUCCESS' ? 'ok' : buyer.enrichmentStatus === 'FAILED' ? 'fail' : 'neutral'}>
                  {enrichmentLabel[buyer.enrichmentStatus]}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <Button onClick={runEnrich} disabled={enrich.state === 'running' || !buyer.website} title={buyer.website ? undefined : 'This buyer has no website to enrich from'}>
              {enrich.state === 'running' ? 'Enriching…' : 'Enrich company'}
            </Button>
            {!buyer.website && <p className="text-xs text-faint">No website on record to enrich from.</p>}
            {enrich.state === 'done' && <p className="text-xs text-ok">Enrichment finished.</p>}
            {enrich.state === 'error' && <p role="alert" className="max-w-xs text-xs text-fail sm:text-right">{enrich.message}</p>}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Section title="Contact">
          <Row label="Contact person">{val(buyer.contactName)}</Row>
          <Row label="Designation">{val(buyer.contactRole)}</Row>
          <Row label="Phone">{buyer.phone ? <a className="tabular hover:underline" href={`tel:${buyer.phone}`}>{buyer.phone}</a> : NA}</Row>
          <Row label="Email">{buyer.email ? <a className="hover:underline" href={`mailto:${buyer.email}`}>{buyer.email}</a> : NA}</Row>
          <Row label="Website">{buyer.website ? <a className="text-harbor hover:underline" href={toHref(buyer.website)} target="_blank" rel="noreferrer noopener">{buyer.website}</a> : NA}</Row>
        </Section>

        <Section title="Product">
          <Row label="Product">{val(buyer.product)}</Row>
          <Row label="HS code"><span className="tabular">{val(buyer.hsCode)}</span></Row>
          <Row label="Activity">{buyer.activityType ? ACTIVITY_LABEL[buyer.activityType] : NA}</Row>
          <Row label="Partner country">{val(buyer.partnerCountry)}</Row>
        </Section>

        <Section title="Source">
          <Row label="Source">{buyer.source}</Row>
          <Row label="Last confirmed active">{buyer.lastConfirmedActive ? formatDate(buyer.lastConfirmedActive) : NA}</Row>
          <Row label="Added">{formatDate(buyer.createdAt)}</Row>
          <Row label="Updated">{formatDate(buyer.updatedAt)}</Row>
        </Section>

        <Section
          title="Import activity"
          note="Shipment details come from shipment-level sources such as Volza, which is not configured. Import activity shows documented trade, not current demand."
        >
          <Row label="Last shipment">{NA}</Row>
          <Row label="Shipment frequency">{NA}</Row>
          <Row label="Quantity">{NA}</Row>
        </Section>
      </div>
    </>
  )
}

/** Loads GET /api/buyers/{id} and renders the buyer intelligence profile. */
export default function BuyerProfile({ id }: { id: string }) {
  const buyer = useBuyer(id)
  const back = <ButtonLink to="/buyers" variant="secondary">Back to Buyer Discovery</ButtonLink>

  switch (buyer.status) {
    case 'loading':
      return (
        <div className="rounded-lg border border-line bg-surface px-7 py-7">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-3 h-8 w-72 max-w-full" />
          <Skeleton className="mt-3 h-4 w-40" />
        </div>
      )
    case 'ready':
      return <Profile key={buyer.data.id} initial={buyer.data} />
    case 'unavailable':
    case 'offline':
      return <ErrorState title="Buyer discovery service is currently unavailable." message="Buyer profiles open once the service is running." onRetry={buyer.reload} />
    case 'error':
      return buyer.code === 'BUYER_NOT_FOUND'
        ? <EmptyState title="Buyer not found" description="This buyer record doesn't exist or has been removed." action={back} />
        : <ErrorState title="Couldn't load this buyer" message={buyer.message} onRetry={buyer.reload} />
  }
}
