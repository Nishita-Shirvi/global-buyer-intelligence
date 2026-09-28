import type { BadgeTone } from '../components/Badge'

export type DataSourceStatus =
  | 'CONNECTED'       // API configured and responding (not the case for any source yet)
  | 'EXTERNAL'        // used through its own website; no API connection
  | 'NOT_CONFIGURED'  // API credentials/access missing
  | 'PLANNED'         // not built yet
  | 'UNAVAILABLE'     // configured, currently failing

export type ProviderType = 'TRADE_INTELLIGENCE' | 'SHIPMENT_INTELLIGENCE' | 'WEB_ENRICHMENT'

export interface DataSource {
  provider: string
  displayName: string
  /** How the platform uses the source today. */
  status: DataSourceStatus
  /** State of a programmatic API connection, when that differs from `status`. */
  apiStatus?: DataSourceStatus
  providerType: ProviderType
  message: string
  /** Official website, opened in a new tab. */
  url?: string
}

export const STATUS_LABEL: Record<DataSourceStatus, string> = {
  CONNECTED: 'Connected',
  EXTERNAL: 'External source',
  NOT_CONFIGURED: 'API not configured',
  PLANNED: 'Planned',
  UNAVAILABLE: 'Unavailable',
}

export const STATUS_TONE: Record<DataSourceStatus, BadgeTone> = {
  CONNECTED: 'ok',
  EXTERNAL: 'harbor',
  NOT_CONFIGURED: 'neutral',
  PLANNED: 'neutral',
  UNAVAILABLE: 'fail',
}

export const PROVIDER_TYPE_LABEL: Record<ProviderType, string> = {
  TRADE_INTELLIGENCE: 'Trade intelligence',
  SHIPMENT_INTELLIGENCE: 'Shipment intelligence',
  WEB_ENRICHMENT: 'Web enrichment',
}
