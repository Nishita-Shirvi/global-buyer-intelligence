import { useCallback, useEffect, useState } from 'react'
import { ApiError, getBuyer, getBuyers, isEndpointMissing, isUnreachable, type BuyerQuery, type Page } from './api'
import type { Buyer } from '../types/buyer'

/**
 * Loading state for any backend resource.
 * - unavailable: the backend is up but this endpoint is not built yet
 * - offline: the backend could not be reached
 */
export type Resource<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'unavailable' }
  | { status: 'offline' }
  | { status: 'error'; message: string; code?: string }

export function toResourceError<T>(err: unknown): Resource<T> {
  if (isEndpointMissing(err)) return { status: 'unavailable' }
  if (isUnreachable(err)) return { status: 'offline' }
  return { status: 'error', message: (err as Error).message, code: err instanceof ApiError ? err.code : undefined }
}

/** Runs a loader on mount and whenever `key` changes. `reload()` runs it again. */
export function useResource<T>(loader: (signal: AbortSignal) => Promise<T>, key: string): Resource<T> & { reload: () => void } {
  const [state, setState] = useState<Resource<T>>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setState({ status: 'loading' })
    loader(controller.signal)
      .then((data) => setState({ status: 'ready', data }))
      .catch((err: Error) => {
        if (err.name !== 'AbortError') setState(toResourceError<T>(err))
      })
    return () => controller.abort()
    // loader is recreated each render; `key` captures its inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])
  return { ...state, reload }
}

/** Stored buyers from GET /api/buyers (server-side filtering and paging). */
export function useBuyers(query: BuyerQuery) {
  return useResource<Page<Buyer>>((signal) => getBuyers(query, signal), JSON.stringify(query))
}

/** One buyer from GET /api/buyers/{id}. */
export function useBuyer(id: string) {
  return useResource<Buyer>((signal) => getBuyer(id, signal), id)
}
