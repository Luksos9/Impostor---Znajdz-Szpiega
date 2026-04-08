import { colors, fonts, fontSizes, fontWeights, spacing, radii } from '../styles/theme'
import { L } from '../utils/labels'

// Full-screen blocker between private reveals.
// Shown before every CardReveal and before every private vote.
// Two-line copy: name of next player + physical "flip and pass" cue.
export default function PrivacyHandoff({ playerName, onReady }) {
  return (
    <div
      style={{
        minHeight: '100vh',
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
      <div
        style={{
          fontSize: fontSizes.eyebrow,
          fontWeight: fontWeights.bold,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
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
        }}
      >
        {L.privacy.flipAndPass}
      </p>

      <button
        onClick={onReady}
        style={{
          background: colors.textPrimary,
          border: 'none',
          borderRadius: radii.xl,
          color: colors.bg,
          fontSize: fontSizes.bodyLg,
          fontWeight: fontWeights.bold,
          padding: `${spacing.lg}px ${spacing.xxl}px`,
          cursor: 'pointer',
          minWidth: 240,
          transition: 'transform 0.08s ease',
        }}
        onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.02)' }}
        onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
      >
        {L.privacy.iAmReady}
      </button>
    </div>
  )
}
