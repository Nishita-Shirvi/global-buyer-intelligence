import { formatCount } from '../services/format'
import { Skeleton } from './Loader'

interface StatCardProps {
  label: string
  /** null = not counted (service unavailable). 0 is a real count. */
  value: number | null
  caption: string
  loading?: boolean
}

/** One cell of the KPI strip. The strip itself draws the dividers. */
export default function StatCard({ label, value, caption, loading = false }: StatCardProps) {
  return (
    <div className="px-5 py-5 sm:px-6">
      <p className="text-[13px] font-medium text-muted">{label}</p>
      {loading ? (
        <Skeleton className="mt-2.5 h-8 w-16" />
      ) : (
        <p className="tabular mt-1.5 text-[32px] font-bold leading-tight tracking-[-0.02em] text-ink">
          {value === null ? <span className="text-faint">–</span> : formatCount(value)}
        </p>
      )}
      <p className="mt-1 text-[13px] leading-snug text-faint">{caption}</p>
    </div>
  )
}
