// Single entry point for backend calls. The frontend only ever talks to the
// backend API (/api), never to ITC Trade Map, Volza, or company websites.
import type { Buyer, BuyerSearchRequest } from '../types/buyer'
import type { DataSource } from '../types/datasource'

export class ApiError extends Error {
  readonly status: number
  readonly code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

interface ErrorBody {
  message?: string
  code?: string
}

const UNREACHABLE = "We couldn't reach the data service."

async function request<T>(method: 'GET' | 'POST', path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  let response: Response
  try {
    const init: RequestInit =
      method === 'POST'
        ? { method, signal, headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(body ?? {}) }
        : { method, signal, headers: { Accept: 'application/json' } }
    response = await fetch(`/api${path}`, init)
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err
    throw new ApiError(UNREACHABLE, 0, 'UNREACHABLE')
  }

  if (!response.ok) {
    let parsed: ErrorBody = {}
    try {
      parsed = (await response.json()) as ErrorBody
    } catch {
      // Non-JSON body. A bare 502/504 comes from the dev proxy when the backend is down.
      if (response.status === 502 || response.status === 504) throw new ApiError(UNREACHABLE, response.status, 'UNREACHABLE')
    }
    throw new ApiError(parsed.message ?? `Request failed with status ${response.status}.`, response.status, parsed.code)
  }

  return (await response.json()) as T
}

/** True when the backend is up but this endpoint has not been built yet. */
export function isEndpointMissing(err: unknown): boolean {
  return err instanceof ApiError && err.status === 404 && err.code === 'NOT_FOUND'
}

export function isUnreachable(err: unknown): boolean {
  return err instanceof ApiError && err.code === 'UNREACHABLE'
}

// ---------------------------------------------------------------- health
export interface HealthResponse {
  status: string
  /** MySQL connectivity as seen by the backend, when it reports it. */
  database?: 'ok' | 'down'
}
export const getHealth = (signal?: AbortSignal) => request<HealthResponse>('GET', '/health', undefined, signal)

// ---------------------------------------------------------------- dashboard
/** Contract for GET /api/dashboard/stats (Phase 8). Every value is counted from MySQL. */
export interface DashboardStats {
  totalBuyers: number
  marketsCovered: number
  productsCovered: number
  activeImporters: number
  buyersByMarket: { country: string; count: number }[]
  buyersByProduct: { product: string; hsCode: string | null; count: number }[]
}
export const getDashboardStats = (signal?: AbortSignal) => request<DashboardStats>('GET', '/dashboard/stats', undefined, signal)

// ---------------------------------------------------------------- buyers
/** Page shape returned by GET /api/buyers. */
export interface Page<T> {
  items: T[]
  total: number
  page: number
  size: number
}

export interface BuyerQuery {
  product?: string
  country?: string
  city?: string
  hsCode?: string
  source?: string
  page?: number
  size?: number
  sort?: string
}

export function getBuyers(query: BuyerQuery, signal?: AbortSignal) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  const qs = params.toString()
  return request<Page<Buyer>>('GET', `/buyers${qs ? `?${qs}` : ''}`, undefined, signal)
}

export const getBuyer = (id: string, signal?: AbortSignal) =>
  request<Buyer>('GET', `/buyers/${encodeURIComponent(id)}`, undefined, signal)

export const searchBuyers = (body: BuyerSearchRequest, signal?: AbortSignal) =>
  request<Buyer[]>('POST', '/buyers/search', body, signal)

export const enrichBuyer = (id: number) => request<Buyer>('POST', `/buyers/${id}/enrich`, {})


// ---------------------------------------------------------------- data sources
/**
 * Static configuration, until GET /api/data-sources exists.
 * Today both sources are used through their official websites. Neither has an API
 * connection, so neither is ever shown as "Connected".
 */
export const DATA_SOURCES: DataSource[] = [
  {
    provider: 'ITC',
    displayName: 'ITC Trade Map',
    status: 'EXTERNAL',
    providerType: 'TRADE_INTELLIGENCE',
    message: 'Global trade statistics and company intelligence.',
    url: 'https://www.trademap.org/',
  },
  {
    provider: 'VOLZA',
    displayName: 'Volza',
    status: 'EXTERNAL',
    apiStatus: 'NOT_CONFIGURED',
    providerType: 'SHIPMENT_INTELLIGENCE',
    message: 'Global import/export and shipment intelligence.',
    url: 'https://www.volza.com/',
  },
]

/** Opens an official source website in a new tab, without giving it access to this page. */
export function openExternal(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

/**
 * Where to look for buyers on the source's own website, for a product and country.
 * For ITC Trade Map this is the importing-companies page when the product has a verified
 * HS code and the country's ISO numeric code is known (the pattern observed for
 * Russia / coffee: /en/goods/companies/c/643/imports/p/0901); otherwise the homepage.
 * Volza has no public deep link, so it opens its homepage.
 */
export function sourceSearchUrl(provider: string, hsCode: string | null, isoNumeric: string | null): string {
  const source = DATA_SOURCES.find((s) => s.provider === provider)
  const home = source?.url ?? 'https://www.trademap.org/'
  if (provider === 'ITC' && hsCode && isoNumeric) {
    return `https://www.trademap.org/en/goods/companies/c/${isoNumeric}/imports/p/${hsCode}`
  }
  return home
}
