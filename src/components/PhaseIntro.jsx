import { colors, fonts, fontSizes, fontWeights, spacing, radii } from '../styles/theme'

// Bridge screen between phases. Used to tell players in plain Polish what's
// about to happen and who goes first. Shows up between reveal-loop and
// describe/write phases so the transition is never surprising.
//
// Props:
//   eyebrow:    small label at the top (optional)
//   title:      big headline (what's happening now)
//   description: 1-3 sentence explanation (what players should do)
//   buttonText: CTA label
//   accent:     hex color for eyebrow and button (defaults to white)
//   onContinue: called when the button is tapped
export default function PhaseIntro({ eyebrow, title, description, buttonText, accent, onContinue }) {
  const buttonBg = accent || colors.textPrimary
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 96px)',
        background: colors.bg,
        color: colors.textPrimary,
        fontFamily: fonts.sans,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
        textAlign: 'center',
      }}
    >
      {eyebrow && (
        <div
          style={{
            fontSize: fontSizes.eyebrow,
            fontWeight: fontWeights.bold,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: accent || colors.textMuted,
            marginBottom: spacing.md,
          }}
        >
          {eyebrow}
        </div>
      )}

      <h1
        style={{
          fontSize: fontSizes.h1,
          fontWeight: fontWeights.black,
          margin: 0,
          marginBottom: spacing.lg,
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          maxWidth: 360,
        }}
      >
        {title}
      </h1>

      {description && (
        <p
          style={{
            fontSize: fontSizes.bodyLg,
            color: colors.textSecondary,
            maxWidth: 360,
            margin: 0,
            marginBottom: spacing.xxl,
            lineHeight: 1.45,
          }}
        >
          {description}
        </p>
      )}

      <button
        onClick={onContinue}
        style={{
          background: buttonBg,
          border: 'none',
          borderRadius: radii.xl,
          color: colors.bg,
          fontSize: fontSizes.h3,
          fontWeight: fontWeights.black,
          paddingTop: spacing.lg,
          paddingBottom: spacing.lg,
          paddingLeft: spacing.xxl,
          paddingRight: spacing.xxl,
          cursor: 'pointer',
          minWidth: 260,
        }}
      >
        {buttonText}
      </button>
    </div>
  )
}
