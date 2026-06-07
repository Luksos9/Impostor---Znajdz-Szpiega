import { useState } from 'react'
import { colors, fonts, fontSizes, fontWeights, spacing } from '../styles/theme'
import { L } from '../utils/labels'
import Button from './ui/Button'
import { hapticMedium } from '../utils/haptics'
import { playSound } from '../utils/sounds'

// Single voter's voting screen. Shows every player except the voter themselves.
// Single tap commits a vote, disables all buttons, and calls onVote(targetId).
// Parent wraps this in a PrivacyHandoff loop so each voter votes privately.
export default function VoteGrid({ players, voterId, voterName, onVote, accent }) {
  const [voted, setVoted] = useState(false)
  const candidates = players.filter((p) => p.id !== voterId)
  const cols = candidates.length <= 4 ? '1fr' : '1fr 1fr'

  const handleVote = (targetId) => {
    if (voted) return
    setVoted(true)
    hapticMedium()
    playSound('vote')
    onVote(targetId)
  }

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
        {candidates.map((p, idx) => (
          <Button
            key={p.id}
            variant="secondary"
            size="lg"
            accentColor={accent || colors.textPrimary}
            fullWidth
            disabled={voted}
            onClick={() => handleVote(p.id)}
            style={{
              animationName: 'fadeSlideUp',
              animationDuration: '360ms',
              animationTimingFunction: 'cubic-bezier(0.22,1,0.36,1)',
              animationFillMode: 'both',
              animationDelay: `${idx * 60}ms`,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {p.name}
          </Button>
        ))}
      </div>

      {voted && (
        <div
          className="anim-enter"
          style={{
            textAlign: 'center',
            marginTop: spacing.lg,
            fontSize: fontSizes.body,
            fontWeight: fontWeights.extraBold,
            color: colors.success,
          }}
        >
          {L.vote.confirmed}
        </div>
      )}
    </div>
  )
}
