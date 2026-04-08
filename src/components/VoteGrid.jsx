import { colors, fonts, fontSizes, fontWeights, spacing } from '../styles/theme'
import { L } from '../utils/labels'
import Button from './ui/Button'

// Single voter's voting screen. Shows every player except the voter themselves.
// Single tap commits a vote and calls onVote(targetId).
// Parent wraps this in a PrivacyHandoff loop so each voter votes privately.
export default function VoteGrid({ players, voterId, voterName, onVote, accent }) {
  const candidates = players.filter((p) => p.id !== voterId)
  // 1-col on tight screens (≤4 candidates) so labels never truncate, 2-col otherwise.
  const cols = candidates.length <= 4 ? '1fr' : '1fr 1fr'

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
        paddingTop: spacing.xl,
        paddingBottom: spacing.xl + 8,
        paddingLeft: spacing.lg,
        paddingRight: spacing.lg,
      }}
    >
      <div
        style={{
          fontSize: fontSizes.eyebrow,
          fontWeight: fontWeights.extraBold,
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: accent || colors.textMuted,
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
          letterSpacing: '-0.02em',
          color: colors.textPrimary,
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
          fontWeight: fontWeights.semibold,
        }}
      >
        {L.vote.instruction}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: cols,
          gap: spacing.md,
        }}
      >
        {candidates.map((p) => (
          <Button
            key={p.id}
            variant="secondary"
            size="lg"
            accentColor={accent || colors.textPrimary}
            fullWidth
            onClick={() => onVote(p.id)}
          >
            {p.name}
          </Button>
        ))}
      </div>
    </div>
  )
}
