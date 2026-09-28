/**
 * Focus markets for the initial research. Configuration, not business data:
 * coordinates are approximate country centroids, used only to place markers on the globe.
 * isoNumeric is the ISO 3166-1 numeric code, used by ITC Trade Map URLs.
 */
export interface TargetMarket {
  country: string
  region: string
  isoAlpha2: string
  isoNumeric: string
  lat: number
  lon: number
}

export const TARGET_MARKETS: TargetMarket[] = [
  { country: 'Russia', region: 'Europe / Asia', isoAlpha2: 'RU', isoNumeric: '643', lat: 61.5, lon: 99.0 },
  { country: 'South Africa', region: 'Africa', isoAlpha2: 'ZA', isoNumeric: '710', lat: -29.0, lon: 24.0 },
  { country: 'Nigeria', region: 'Africa', isoAlpha2: 'NG', isoNumeric: '566', lat: 9.1, lon: 8.7 },
  { country: 'Egypt', region: 'Africa', isoAlpha2: 'EG', isoNumeric: '818', lat: 26.8, lon: 30.8 },
  { country: 'Morocco', region: 'Africa', isoAlpha2: 'MA', isoNumeric: '504', lat: 31.8, lon: -7.1 },
  { country: 'Kenya', region: 'Africa', isoAlpha2: 'KE', isoNumeric: '404', lat: 0.0, lon: 37.9 },
]

/** Where the business sources its products. */
export const ORIGIN = { country: 'India', lat: 21.0, lon: 78.0 }

/**
 * Every country, so search is global rather than limited to the focus markets.
 * Names come from the browser's own Intl region data, not a hand-typed list.
 */
export const ALL_COUNTRIES: string[] = (() => {
  const names = new Intl.DisplayNames(['en'], { type: 'region' })
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  // Codes Intl resolves but that are not countries (reserved, grouping, or placeholder codes).
  const notCountries = new Set(['EU', 'EZ', 'UN', 'QO', 'XA', 'XB', 'XK', 'ZZ', 'AA', 'QM', 'QN', 'QP', 'QQ', 'QR', 'QS', 'QT', 'QU', 'QV', 'QW', 'QX', 'QY', 'QZ', 'XC', 'XD', 'XE', 'XF', 'XG', 'XH', 'XI', 'XJ', 'XL', 'XM', 'XN', 'XO', 'XP', 'XQ', 'XR', 'XS', 'XT', 'XU', 'XV', 'XW', 'XX', 'XY', 'XZ', 'AC', 'CP', 'DG', 'EA', 'IC', 'TA', 'CQ'])
  const out = new Set<string>()
  for (const a of letters) for (const b of letters) {
    const code = a + b
    if (notCountries.has(code)) continue
    try {
      const name = names.of(code)
      if (name && name !== code && !/unknown/i.test(name)) out.add(name)
    } catch { /* not a region code */ }
  }
  return [...out].sort((x, y) => x.localeCompare(y))
})()

export const findMarket = (country: string | null | undefined) =>
  TARGET_MARKETS.find((m) => m.country.toLowerCase() === (country ?? '').toLowerCase()) ?? null
