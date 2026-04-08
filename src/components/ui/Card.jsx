import { useId } from 'react'
import { colors, spacing, radii, shadows } from '../../styles/theme'

// Card — the universal rounded white surface used across the redesign.
//
// Props:
//   elevation: 'soft' | 'medium' | 'strong' — drops a tiered shadow
//   accent:    optional hex — draws a 4px left stripe in that color
//   accentTop: optional hex — draws a 4px top stripe in that color
//   padded:    'sm' | 'md' | 'lg' | 'none'
//   onClick:   if set, becomes a pressable <button> with tactile feel
//   border:    'none' | 'soft' | 'strong' (default 'soft')
//
// Without onClick → renders a <div>.
// With onClick    → renders a <button> that translates down on :active.
export default function Card({
  elevation = 'soft',
  accent = null,
  accentTop = null,
  padded = 'lg',
  onClick = null,
  border = 'soft',
  children,
  style: extraStyle,
  className: extraClassName,
}) {
  const reactId = useId()
  const safeId = reactId.replace(/:/g, '')
  const className = onClick ? `card-tactile-${safeId}` : ''

  const padMap = {
    none: 0,
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
  }
  const pad = padMap[padded] ?? spacing.lg

  const shadow = shadows[elevation] || shadows.soft

  const borderStyle =
    border === 'none'
      ? 'none'
      : border === 'strong'
        ? `2px solid ${colors.borderStrong}`
        : `1px solid ${colors.border}`

  const baseStyle = {
    background: colors.surface,
    borderRadius: radii.xl,
    border: borderStyle,
    boxShadow: shadow,
    padding: pad,
    color: colors.textPrimary,
    width: '100%',
    textAlign: 'left',
    transform: 'translateY(0)',
    transition: 'transform 90ms ease, box-shadow 90ms ease',
    cursor: onClick ? 'pointer' : 'default',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'inherit',
    ...extraStyle,
  }

  const stripeLeft = accent ? (
    <span
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 5,
        background: accent,
      }}
    />
  ) : null

  const stripeTop = accentTop ? (
    <span
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 5,
        background: accentTop,
      }}
    />
  ) : null

  // Scoped CSS for tactile press if interactive
  const scopedCss = onClick
    ? `
        .${className}:active:not(:disabled) {
          transform: translateY(3px);
          box-shadow: ${shadows.soft};
        }
        .${className}:focus-visible {
          outline: none;
          box-shadow: ${shadow}, 0 0 0 3px rgba(43,43,43,0.18);
        }
      `
    : ''

  if (onClick) {
    return (
      <>
        <style>{scopedCss}</style>
        <button
          type="button"
          className={`${className} ${extraClassName || ''}`.trim()}
          onClick={onClick}
          style={baseStyle}
        >
          {stripeLeft}
          {stripeTop}
          {children}
        </button>
      </>
    )
  }

  return (
    <div className={extraClassName} style={baseStyle}>
      {stripeLeft}
      {stripeTop}
      {children}
    </div>
  )
}
