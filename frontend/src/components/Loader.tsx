export default function Loader({ label = 'Loading' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted" role="status">
      <span className="size-3.5 animate-spin rounded-full border-2 border-line border-t-harbor" aria-hidden />
      {label}
    </span>
  )
}

/** Placeholder bar shown while real content loads. Never shows fake values. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <span aria-hidden className={`skeleton block ${className}`} />
}
