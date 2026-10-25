import { useEffect, useRef } from 'react'

// Calls fn every ms and whenever the window regains focus.
export default function usePolling(fn, ms) {
  const saved = useRef(fn)
  saved.current = fn

  useEffect(() => {
    const tick = () => saved.current()
    const id = setInterval(tick, ms)
    window.addEventListener('focus', tick)
    return () => {
      clearInterval(id)
      window.removeEventListener('focus', tick)
    }
  }, [ms])
}
