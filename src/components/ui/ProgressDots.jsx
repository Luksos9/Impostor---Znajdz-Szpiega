import { useEffect, useRef, useState } from 'react'
import { colors, spacing } from '../../styles/theme'

// Segmented round progress: a row of small chunky dots.
// Filled dots use the active accent + a thin tactile under-shadow.
// The newly-completed dot pops once on the transition (driven by useRef
// tracking the previous value, so re-renders don't retrigger the animation).
export default function ProgressDots({
  current = 0,
  total = 5,
  accentColor = colors.textPrimary,
  size = 'md',
}) {
  const prevRef = useRef(current)
  const [popIdx, setPopIdx] = useState(-1)

  useEffect(() => {
    if (current > prevRef.current) {
      // Pop the dot that just became active.
      setPopIdx(current)
      const t = setTimeout(() => setPopIdx(-1), 500)
      prevRef.current = current
      return () => clearTimeout(t)
    }
    prevRef.current = current
  }, [current])

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
              background: isActive ? accentColor : colors.border,
              boxShadow: isActive ? `0 ${s.shadow}px 0 rgba(43,43,43,0.18)` : 'none',
              transition: 'background 200ms ease, box-shadow 200ms ease',
            }}
          />
        )
      })}
    </div>
  )
}
