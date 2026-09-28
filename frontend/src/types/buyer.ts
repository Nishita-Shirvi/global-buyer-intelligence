// Mirrors the planned `buyers` table. Every field except identity and source
// may be missing in real data, so it is nullable rather than filled with a guess.

export type ActivityType = 'IMPORTER' | 'EXPORTER' | 'IMPORTER_EXPORTER' | 'DISTRIBUTOR' | 'UNKNOWN'

export type EnrichmentStatus = 'NOT_ENRICHED' | 'SUCCESS' | 'FAILED'

export interface Buyer {
  id: number
  companyName: string
  country: string
  city: string | null
  product: string | null
  hsCode: string | null
  website: string | null
  contactName: string | null
  contactRole: string | null
  email: string | null
  phone: string | null
  activityType: ActivityType | null
  /** Where the record came from, e.g. "ITC Trade Map / Kompass". Always present. */
  source: string
  partnerCountry: string | null
  lastConfirmedActive: string | null
  enrichmentStatus?: EnrichmentStatus | null
  createdAt: string
  updatedAt: string
}

export interface BuyerSearchRequest {
  product: string
  country: string
  hsCode: string
  source: string
}

export const ACTIVITY_LABEL: Record<ActivityType, string> = {
  IMPORTER: 'Importer',
  EXPORTER: 'Exporter',
  IMPORTER_EXPORTER: 'Importer / exporter',
  DISTRIBUTOR: 'Distributor',
  UNKNOWN: 'Unknown',
}
