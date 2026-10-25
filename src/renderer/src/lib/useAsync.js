import { useCallback, useEffect, useRef, useState } from 'react'

// Runs an async loader on mount and whenever deps change.
export default function useAsync(loader, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const seq = useRef(0)

  const run = useCallback(
    async ({ silent = false } = {}) => {
      const my = ++seq.current
      if (!silent) setState((s) => ({ ...s, loading: true, error: null }))
      try {
        const data = await loader()
        if (my === seq.current) setState({ data, error: null, loading: false })
      } catch (error) {
        if (my === seq.current) setState((s) => ({ ...s, error, loading: false }))
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  )

  useEffect(() => {
    run()
  }, [run])

  return { ...state, reload: run }
}
