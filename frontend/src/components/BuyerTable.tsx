import { useState } from 'react'
import { Link } from 'react-router-dom'
import { enrichBuyer } from '../services/api'
import { ACTIVITY_LABEL, type Buyer } from '../types/buyer'
import { orNA, toHref } from '../services/format'
import Badge from './Badge'
import Button, { ButtonLink } from './Button'
import BuyerCard from './BuyerCard'

interface BuyerTableProps {
  buyers: Buyer[]
  /** compact: dashboard columns. full: every Buyer Discovery column plus Enrich. */
  columns?: 'compact' | 'full'
  onBuyerUpdated?: (buyer: Buyer) => void
}

const th = 'whitespace-nowrap px-4 py-2.5 text-left text-[13px] font-medium text-muted first:pl-5 last:pr-5'
const td = 'px-4 py-3 align-top text-sm first:pl-5 last:pr-5'
const na = (v: string | null) => (v && v.trim() ? v : <span className="text-faint">N/A</span>)

export default function BuyerTable({ buyers, columns = 'full', onBuyerUpdated }: BuyerTableProps) {
  const full = columns === 'full'
  const [enriching, setEnriching] = useState<Record<number, 'running' | string>>({})

  async function enrich(buyer: Buyer) {
    setEnriching((s) => ({ ...s, [buyer.id]: 'running' }))
    try {
      const updated = await enrichBuyer(buyer.id)
      onBuyerUpdated?.(updated)
      setEnriching(({ [buyer.id]: _done, ...rest }) => rest)
    } catch (err) {
      setEnriching((s) => ({ ...s, [buyer.id]: (err as Error).message }))
    }
  }

  return (
    <>
      <ul className="divide-y divide-line md:hidden">
        {buyers.map((b) => <li key={b.id}><BuyerCard buyer={b} /></li>)}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px]">
          <thead className="border-b border-line bg-paper/60">
            <tr>
              <th className={th}>Company</th>
              <th className={th}>Country</th>
              <th className={th}>City</th>
              <th className={th}>Product</th>
              {full && <th className={th}>HS code</th>}
              <th className={th}>Activity</th>
              {full && <th className={th}>Contact</th>}
              {full && <th className={th}>Phone</th>}
              {full && <th className={th}>Website</th>}
              <th className={th}>Source</th>
              <th className={`${th} text-right`}><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {buyers.map((b) => {
              const state = enriching[b.id]
              return (
                <tr key={b.id} className="hover:bg-paper/60">
                  <td className={`${td} min-w-[11rem] max-w-[16rem] font-medium text-ink [overflow-wrap:anywhere]`}>
                    <Link to={`/buyers/${b.id}`} className="hover:underline">{b.companyName}</Link>
                  </td>
                  <td className={`${td} whitespace-nowrap`}>{b.country}</td>
                  <td className={`${td} whitespace-nowrap`}>{na(b.city)}</td>
                  <td className={td}>{na(b.product)}</td>
                  {full && <td className={`${td} tabular`}>{na(b.hsCode)}</td>}
                  <td className={td}>
                    {b.activityType ? <Badge tone="harbor">{ACTIVITY_LABEL[b.activityType]}</Badge> : <span className="text-faint">N/A</span>}
                  </td>
                  {full && (
                    <td className={td}>
                      {b.contactName ? (
                        <>
                          <span className="block">{b.contactName}</span>
                          {b.contactRole && <span className="block text-[13px] text-faint">{b.contactRole}</span>}
                        </>
                      ) : <span className="text-faint">N/A</span>}
                    </td>
                  )}
                  {full && <td className={`${td} tabular whitespace-nowrap`}>{b.phone ? <a href={`tel:${b.phone}`} className="hover:underline">{b.phone}</a> : <span className="text-faint">N/A</span>}</td>}
                  {full && (
                    <td className={`${td} max-w-[12rem] [overflow-wrap:anywhere]`}>
                      {b.website ? <a href={toHref(b.website)} target="_blank" rel="noreferrer noopener" className="text-harbor hover:underline">{b.website}</a> : <span className="text-faint">N/A</span>}
                    </td>
                  )}
                  <td className={`${td} text-[13px] text-muted`}>{orNA(b.source)}</td>
                  <td className={`${td} whitespace-nowrap text-right`}>
                    <span className="inline-flex items-center gap-1">
                      <ButtonLink to={`/buyers/${b.id}`} variant="ghost">View</ButtonLink>
                      {full && (
                        <Button
                          variant="ghost"
                          onClick={() => enrich(b)}
                          disabled={state === 'running' || !b.website}
                          title={b.website ? 'Add public details from the company website' : 'No website to enrich from'}
                        >
                          {state === 'running' ? 'Enriching…' : 'Enrich'}
                        </Button>
                      )}
                    </span>
                    {state && state !== 'running' && <span className="mt-1 block max-w-[14rem] whitespace-normal text-left text-xs text-fail">{state}</span>}
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
