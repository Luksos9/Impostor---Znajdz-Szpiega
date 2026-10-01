import { useEffect, useState } from 'react'
import { colors, spacing } from '../../styles/theme'

// Segmented round progress: a row of small chunky dots.
// Filled dots use the active accent + a thin tactile under-shadow.
// The newly-completed dot pops once on the transition (the previous value is
// kept in state, so re-renders don't retrigger the animation).
export default function ProgressDots({
  current = 0,
  total = 5,
  accentColor = colors.textPrimary,
  size = 'md',
}) {
  // Pop the dot that just became active: compare with the previous prop during
  // render (React's documented alternative to a set-state-in-effect), then clear
  // the animation flag after it has played.
  const [prev, setPrev] = useState(current)
  const [popIdx, setPopIdx] = useState(-1)
  if (current !== prev) {
    setPrev(current)
    setPopIdx(current > prev ? current : -1)
  }
  useEffect(() => {
    if (popIdx < 0) return undefined
    const t = setTimeout(() => setPopIdx(-1), 500)
    return () => clearTimeout(t)
  }, [popIdx])

  const sizes = {
    sm: { dot: 10, gap: spacing.xs, shadow: 2 },
    md: { dot: 14, gap: spacing.sm, shadow: 3 },
  }
  const s = sizes[size] || sizes.md

  return (
    <div
      role="progressbar"
      aria-valuenow={current + 1}
      aria-valuemin={1}
      aria-valuemax={total}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: s.gap,
        // Bottom space so the under-shadow on filled dots has breathing room.
        paddingBottom: s.shadow,
      }}
    >
      {Array.from({ length: total }).map((_, idx) => {
        const isActive = idx <= current
        const isPopping = idx === popIdx
        return (
          <span
            key={idx}
            className={isPopping ? 'anim-pop' : undefined}
            style={{
              display: 'inline-block',
              width: s.dot,
              height: s.dot,
              borderRadius: '50%',
              background: isActive ? accentColor : colors.textDim,
              boxShadow: isActive ? `0 ${s.shadow}px 0 var(--shadow-tactile-neutral)` : 'none',
              transition: 'background 200ms ease, box-shadow 200ms ease',
            }}
          />
        )
      })}
    </div>
  )
}
