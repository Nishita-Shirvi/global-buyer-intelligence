/** Shows "N/A" instead of a blank or an invented value when data is missing. */
export function orNA(value: string | number | null | undefined, fallback = 'N/A'): string {
  if (value === null || value === undefined) return fallback
  const text = String(value).trim()
  return text === '' ? fallback : text
}

const numberFormat = new Intl.NumberFormat('en-US')
export const formatCount = (n: number) => numberFormat.format(n)

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return 'Not available'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? 'Not available' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Adds a scheme so stored bare domains ("example.ru") open as links. */
export function toHref(website: string): string {
  return /^https?:\/\//i.test(website) ? website : `https://${website}`
}
