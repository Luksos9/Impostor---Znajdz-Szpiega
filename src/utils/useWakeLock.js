import { useEffect } from 'react'

// Keeps the screen awake while `active` (a phone resting on the table during
// discussion must not auto-lock mid-round). Silently does nothing where the
// Screen Wake Lock API is missing. The lock is dropped by the browser whenever
// the page is hidden, so it is re-requested when the page becomes visible again.
export function useWakeLock(active) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return undefined
    let lock = null
    let cancelled = false

    const request = async () => {
      try {
        lock = await navigator.wakeLock.request('screen')
        if (cancelled) lock.release().catch(() => {})
      } catch {
        // Denied (e.g. low battery) — not worth bothering the player.
      }
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible' && (!lock || lock.released)) request()
    }

    request()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      lock?.release().catch(() => {})
    }
  }, [active])
}
