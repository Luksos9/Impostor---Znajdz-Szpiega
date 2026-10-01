import { useEffect, useRef } from 'react'

// Moves focus to a screen's heading when the screen appears. This game swaps whole
// screens in place, so without it a screen-reader user is left "on" an element
// that no longer exists and never hears that anything changed.
// Give the heading `ref={ref}` and `tabIndex={-1}`.
export function useFocusHeading() {
  const ref = useRef(null)
  useEffect(() => {
    ref.current?.focus({ preventScroll: true })
  }, [])
  return ref
}
