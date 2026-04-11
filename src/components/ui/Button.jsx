import { useId } from 'react'
import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  spacing,
  radii,
  tactileShadow,
} from '../../styles/theme'
import { hapticLight } from '../../utils/haptics'

// Tactile button — the signature Duolingo two-tone press effect.
//
// Variants:
//   primary    → filled accent, white label, accent under-shadow
//   secondary  → white bg, 2px accent border, accent text, neutral under-shadow
//   ghost      → transparent, no shadow (back / cancel)
//   dashed     → transparent, 2px dashed accent border (opt-out actions)
//
// Sizes (minHeight): sm 36, md 48, lg 56, hero 72
//
// The :active press effect is impossible via inline styles, so we inject a
// scoped <style> block per instance with a generated className.
export default function Button({
  variant = 'primary',
  size = 'md',
  accentColor,
  shadowColor,
  textColor,
  fullWidth = false,
  disabled = false,
  onClick,
  children,
  type = 'button',
  ariaLabel,
  style: extraStyle,
}) {
  const reactId = useId()
  // useId can return colons; strip to be safe in className.
  const safeId = reactId.replace(/:/g, '')
  const className = `btn-tactile-${safeId}`

  const accent = accentColor || colors.textPrimary
  // Default tactile under-layer is themed via CSS var so dark mode swaps cleanly.
  const undershadow = shadowColor || 'var(--shadow-tactile-neutral)'

  const sizes = {
    sm: { minH: 36, padY: spacing.xs, padX: spacing.md, fs: fontSizes.bodySm, weight: fontWeights.bold,    radius: radii.lg },
    md: { minH: 48, padY: spacing.sm, padX: spacing.lg, fs: fontSizes.body,   weight: fontWeights.extraBold, radius: radii.lg },
    lg: { minH: 56, padY: spacing.md, padX: spacing.lg, fs: fontSizes.h3,     weight: fontWeights.extraBold, radius: radii.xl },
    hero: { minH: 72, padY: spacing.lg, padX: spacing.xl, fs: fontSizes.h2,    weight: fontWeights.black,    radius: radii.xxl },
  }
  const s = sizes[size] || sizes.md

  // Variant style maps
  let bg, color, border, boxShadow, pressedShadow
  if (variant === 'primary') {
    bg = disabled ? colors.border : accent
    color = disabled ? colors.textDim : (textColor || '#FFFFFF')
    border = 'none'
    boxShadow = disabled ? 'none' : tactileShadow(undershadow)
    pressedShadow = '0 0 0 transparent'
  } else if (variant === 'secondary') {
    bg = colors.surface
    color = disabled ? colors.textDim : accent
    border = `2px solid ${disabled ? colors.border : accent}`
    // Neutral tactile under-layer — themed via CSS var
    boxShadow = disabled ? 'none' : tactileShadow(null)
    pressedShadow = '0 0 0 transparent'
  } else if (variant === 'ghost') {
    bg = 'transparent'
    color = disabled ? colors.textDim : colors.textSecondary
    border = 'none'
    boxShadow = 'none'
    pressedShadow = 'none'
  } else if (variant === 'dashed') {
    bg = 'transparent'
    color = disabled ? colors.textDim : colors.textMuted
    border = `2px dashed ${colors.borderStrong}`
    boxShadow = 'none'
    pressedShadow = 'none'
  } else {
    bg = accent
    color = '#FFFFFF'
    border = 'none'
    boxShadow = tactileShadow(undershadow)
    pressedShadow = '0 0 0 transparent'
  }

  const baseStyle = {
    background: bg,
    color,
    border,
    borderRadius: s.radius,
    fontFamily: fonts.sans,
    fontSize: s.fs,
    fontWeight: s.weight,
    paddingTop: s.padY,
    paddingBottom: s.padY,
    paddingLeft: s.padX,
    paddingRight: s.padX,
    minHeight: s.minH,
    width: fullWidth ? '100%' : 'auto',
    cursor: disabled ? 'not-allowed' : 'pointer',
    boxShadow,
    transform: 'translateY(0)',
    transition: 'transform 90ms ease, box-shadow 90ms ease',
    letterSpacing: '0.01em',
    lineHeight: 1.15,
    textAlign: 'center',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    outline: 'none',
    ...extraStyle,
  }

  // Scoped CSS for :active and :focus-visible — kept inline so we don't
  // introduce a CSS file just for two pseudo-class rules per button instance.
  const pressOffset = variant === 'primary' || variant === 'secondary' ? 4 : 0
  const scopedCss = `
    .${className}:active:not(:disabled) {
      transform: translateY(${pressOffset}px);
      box-shadow: ${pressedShadow};
    }
    .${className}:focus-visible {
      outline: none;
      box-shadow: ${boxShadow === 'none' ? '0 0 0 3px rgba(43,43,43,0.18)' : boxShadow + ', 0 0 0 3px rgba(43,43,43,0.18)'};
    }
  `

  return (
    <>
      <style>{scopedCss}</style>
      <button
        type={type}
        className={className}
        onClick={disabled ? undefined : (e) => { hapticLight(); onClick?.(e) }}
        disabled={disabled}
        aria-label={ariaLabel}
        style={baseStyle}
      >
        {children}
      </button>
    </>
  )
}
