import { colors, fonts, fontSizes, fontWeights, spacing } from '../styles/theme'
import Button from './ui/Button'

// Bridge screen between phases. Used to tell players in plain Polish what's
// about to happen and who goes first. Shows up between reveal-loop and
// describe/write phases so the transition is never surprising.
//
// Props:
//   eyebrow:     small label at the top (optional)
//   title:       big headline (what's happening now)
//   description: 1-3 sentence explanation (what players should do)
//   buttonText:  CTA label
//   accent:      mode hex color for eyebrow + tactile button
//   shadowColor: matching darker hex for the tactile under-layer
//   onContinue:  called when the button is tapped
export default function PhaseIntro({
  eyebrow,
  title,
  description,
  buttonText,
  accent,
  shadowColor,
  onContinue,
}) {
  return (
    <div
      className="anim-enter"
      style={{
        flex: 1,
        minHeight: 0,
        background: colors.bg,
        color: colors.textPrimary,
        fontFamily: fonts.sans,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: spacing.md,
        paddingLeft: spacing.lg,
        paddingRight: spacing.lg,
        paddingBottom: spacing.lg,
        textAlign: 'center',
      }}
    >
      {eyebrow && (
        <div
          style={{
            fontSize: fontSizes.eyebrow,
            fontWeight: fontWeights.extraBold,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
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
          marginBottom: spacing.md,
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          maxWidth: 360,
          color: colors.textPrimary,
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
            marginBottom: spacing.xl,
            lineHeight: 1.4,
            fontWeight: fontWeights.semibold,
          }}
        >
          {description}
        </p>
      )}

      <Button
        variant="primary"
        size="lg"
        accentColor={accent || colors.textPrimary}
        shadowColor={shadowColor}
        textColor={accent ? '#FFFFFF' : colors.bg}
        onClick={onContinue}
        style={{ minWidth: 260 }}
      >
        {buttonText}
      </Button>
    </div>
  )
}
