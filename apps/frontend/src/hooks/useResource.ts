import { useEffect, useState } from 'react'

export function useResource<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [result, setResult] = useState<{
    load: (signal: AbortSignal) => Promise<T>
    revision: number
    data: T | null
    error: string
  } | null>(null)
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    let active = true
    const controller = new AbortController()
    load(controller.signal)
      .then((data) => {
        if (active) setResult({ load, revision, data, error: '' })
      })
      .catch((reason: unknown) => {
        if (active && !controller.signal.aborted)
          setResult({
            load,
            revision,
            data: null,
            error:
              reason instanceof Error
                ? reason.message
                : 'Não foi possível carregar os dados.',
          })
      })
    return () => {
      active = false
      controller.abort()
    }
  }, [load, revision])
  const loading = result?.load !== load || result?.revision !== revision
  return {
    data: loading ? null : result.data,
    error: loading ? '' : result.error,
    loading,
    retry: () => setRevision((value) => value + 1),
  }
}
