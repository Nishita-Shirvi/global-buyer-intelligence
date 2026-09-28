import Badge from '../components/Badge'
import Button from '../components/Button'
import { Skeleton } from '../components/Loader'
import { PageHeading } from '../components/Header'
import { ExternalArrow } from '../components/Navigation'
import { useResource } from '../services/useResource'
import { DATA_SOURCES, getHealth, openExternal } from '../services/api'
import { PROVIDER_TYPE_LABEL, STATUS_LABEL, STATUS_TONE } from '../types/datasource'

function StatusRow({ label, state, detail }: { label: string; state: 'loading' | 'up' | 'down' | 'unknown'; detail: string }) {
  const badge = {
    loading: <Skeleton className="h-5 w-20" />,
    up: <Badge tone="ok" dot>Running</Badge>,
    down: <Badge tone="fail" dot>Not reachable</Badge>,
    unknown: <Badge dot>Not reported</Badge>,
  }[state]
  return (
    <li className="grid gap-1 px-5 py-3.5 sm:grid-cols-[12rem_8rem_1fr] sm:items-center sm:gap-4">
      <span className="text-sm font-medium text-ink">{label}</span>
      <span>{badge}</span>
      <span className="text-[13px] text-muted">{detail}</span>
    </li>
  )
}

export default function DataSources() {
  const api = useResource((s) => getHealth(s), 'health')
  const recheck = () => api.reload()

  const apiState = api.status === 'loading' ? 'loading' : api.status === 'ready' && api.data.status === 'ok' ? 'up' : 'down'
  const db = api.status === 'ready' ? api.data.database : undefined
  const dbState = api.status === 'loading' ? 'loading' : db === 'ok' ? 'up' : db === 'down' ? 'down' : apiState === 'down' ? 'down' : 'unknown'

  return (
    <>
      <PageHeading
        title="Data sources"
        description="Where buyer information comes from. Both sources are currently used through their official websites; neither is connected to this platform by API."
      />

      <ul className="mb-10 grid gap-4 md:grid-cols-2">
        {DATA_SOURCES.map((s) => (
          <li key={s.provider} className="flex flex-col rounded-lg border border-line bg-surface p-6">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="mr-auto text-lg font-bold text-ink">{s.displayName}</h2>
              <Badge tone={STATUS_TONE[s.status]}>{STATUS_LABEL[s.status]}</Badge>
              {s.apiStatus && <Badge tone={STATUS_TONE[s.apiStatus]}>{STATUS_LABEL[s.apiStatus]}</Badge>}
            </div>
            <p className="mt-1 text-[13px] text-faint">{PROVIDER_TYPE_LABEL[s.providerType]}</p>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{s.message}</p>
            {s.provider === 'VOLZA' && <p className="mt-2 text-sm leading-relaxed text-muted">Volza integration requires valid provider access.</p>}
            {s.url && (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button onClick={() => openExternal(s.url!)}>
                  Open {s.displayName} <ExternalArrow className="size-3" />
                </Button>
                <span className="text-[13px] text-faint">{s.url}</span>
              </div>
            )}
          </li>
        ))}
      </ul>

      <section aria-labelledby="conn-heading" className="rounded-lg border border-line bg-surface">
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 id="conn-heading" className="text-[15px] font-semibold text-ink">Connection status</h2>
            <p className="text-[13px] text-muted">Checked live against the platform's own backend</p>
          </div>
          <Button variant="secondary" onClick={recheck}>Check again</Button>
        </div>
        <ul className="divide-y divide-line">
          <StatusRow
            label="Backend API"
            state={apiState}
            detail={apiState === 'up' ? 'GET /api/health responded' : apiState === 'down' ? "The backend (FastAPI) isn't running yet. Dashboard, markets, products, and source links work without it." : 'Checking'}
          />
          <StatusRow
            label="Database (MySQL)"
            state={dbState}
            detail={dbState === 'up' ? 'Reported by /api/health' : dbState === 'down' ? 'No database connection reported' : dbState === 'unknown' ? 'The health check did not include a database status' : 'Checking'}
          />
        </ul>
      </section>
    </>
  )
}
