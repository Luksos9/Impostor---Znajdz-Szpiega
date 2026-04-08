import { colors, fonts, fontSizes, fontWeights, spacing, radii } from '../styles/theme'
import { L } from '../utils/labels'

// Single voter's voting screen. Shows every player except the voter themselves.
// Single tap commits a vote and calls onVote(targetId).
// Parent component wraps this in a PrivacyHandoff loop so each voter votes privately.
export default function VoteGrid({ players, voterId, voterName, onVote }) {
  const candidates = players.filter((p) => p.id !== voterId)

  return (
    <div
      style={{
        minHeight: '100vh',
        background: colors.bg,
        color: colors.textPrimary,
        fontFamily: fonts.sans,
        display: 'flex',
        flexDirection: 'column',
        paddingTop: spacing.xl,
        paddingBottom: spacing.lg,
        paddingLeft: spacing.lg,
        paddingRight: spacing.lg,
      }}
    >
      <div
        style={{
          fontSize: fontSizes.eyebrow,
          fontWeight: fontWeights.bold,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: colors.textMuted,
          marginBottom: spacing.sm,
        }}
      >
        {voterName}
      </div>

      <h2
        style={{
          fontSize: fontSizes.h2,
          fontWeight: fontWeights.black,
          margin: 0,
          marginBottom: spacing.sm,
          letterSpacing: '-0.01em',
        }}
      >
        {L.vote.title}
      </h2>

      <p
        style={{
          fontSize: fontSizes.body,
          color: colors.textSecondary,
          margin: 0,
          marginBottom: spacing.xl,
        }}
      >
        {L.vote.instruction}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: candidates.length <= 4 ? '1fr' : '1fr 1fr',
          gap: spacing.md,
        }}
      >
        {candidates.map((p) => (
          <button
            key={p.id}
            onClick={() => onVote(p.id)}
            style={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: radii.lg,
              color: colors.textPrimary,
              fontSize: fontSizes.h3,
              fontWeight: fontWeights.bold,
              padding: `${spacing.xl}px ${spacing.md}px`,
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'transform 0.08s ease, border-color 0.12s ease',
              minHeight: 80,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.01)'
              e.currentTarget.style.borderColor = colors.borderStrong
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.borderColor = colors.border
            }}
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  )
}
