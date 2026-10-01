import { useEffect, useState } from 'react'

// Counts from 0 up (or down) to `value` — the Duolingo "XP ticking up" feel.
// Skips the animation for users who prefer reduced motion.
export default function AnimatedNumber({ value, duration = 650, delay = 0, format = (n) => n }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce || value === 0) {
      setDisplay(value)
      return undefined
    }
    let raf
    let start = null
    const timer = setTimeout(() => {
      const step = (ts) => {
        if (start === null) start = ts
        const t = Math.min((ts - start) / duration, 1)
        const eased = 1 - Math.pow(1 - t, 3)
        setDisplay(Math.round(value * eased))
        if (t < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    }, delay)
    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(raf)
    }
  }, [value, duration, delay])

  return <>{format(display)}</>
}
