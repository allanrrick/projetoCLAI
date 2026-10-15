import { useEffect, useState } from 'react'

export function useResource<T>(load: () => Promise<T>) {
  const [result, setResult] = useState<{
    load: () => Promise<T>
    revision: number
    data: T | null
    error: string
  } | null>(null)
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    let active = true
    load()
      .then((data) => {
        if (active) setResult({ load, revision, data, error: '' })
      })
      .catch((reason: unknown) => {
        if (active)
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
