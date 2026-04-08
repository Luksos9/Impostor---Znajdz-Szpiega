import { colors, fonts, fontSizes, fontWeights, spacing } from '../styles/theme'
import { L } from '../utils/labels'
import Button from './ui/Button'

// Full-screen blocker between private reveals.
// Shown before every CardReveal and before every private vote.
// Mode-agnostic by design — neutral surface, no accent color, just the
// player's name in display size and the "flip and pass" physical cue.
export default function PrivacyHandoff({ playerName, onReady }) {
  return (
    <div
      className="anim-enter"
      style={{
        minHeight: '100dvh',
        background: colors.bg,
        color: colors.textPrimary,
        fontFamily: fonts.sans,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: spacing.lg,
        paddingLeft: spacing.lg,
        paddingRight: spacing.lg,
        paddingBottom: spacing.xl + 8,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: fontSizes.eyebrow,
          fontWeight: fontWeights.extraBold,
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: colors.textMuted,
          marginBottom: spacing.md,
        }}
      >
        {L.privacy.pass}
      </div>

      <h1
        style={{
          fontSize: fontSizes.display,
          fontWeight: fontWeights.black,
          margin: 0,
          marginBottom: spacing.lg,
          letterSpacing: '-0.02em',
          lineHeight: 1.05,
          color: colors.textPrimary,
        }}
      >
        {playerName}
      </h1>

      <p
        style={{
          fontSize: fontSizes.bodyLg,
          color: colors.textSecondary,
          maxWidth: 320,
          margin: 0,
          marginBottom: spacing.xxl,
          lineHeight: 1.4,
          fontWeight: fontWeights.semibold,
        }}
      >
        {L.privacy.flipAndPass}
      </p>

      <Button
        variant="primary"
        size="lg"
        accentColor={colors.textPrimary}
        textColor={colors.bg}
        onClick={onReady}
        style={{ minWidth: 240 }}
      >
        {L.privacy.iAmReady}
      </Button>
    </div>
  )
}
