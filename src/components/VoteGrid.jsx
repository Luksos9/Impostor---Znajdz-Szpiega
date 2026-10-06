import { useEffect, useState } from 'react'
import { colors, fonts, fontSizes, fontWeights, spacing } from '../styles/theme'
import { L } from '../utils/labels'
import Button from './ui/Button'
import { hapticMedium } from '../utils/haptics'
import { playSound } from '../utils/sounds'
import { speak } from '../utils/voice'
import { voteEntryLine } from '../utils/narration'
import { useNudge } from '../utils/useNudge'
import { useFocusHeading } from '../utils/useFocusHeading'

// Single voter's voting screen. Shows every player except the voter themselves.
// Single tap commits a vote, disables all buttons, and calls onVote(targetId).
// Parent wraps this in a PrivacyHandoff loop so each voter votes privately.
// Selection mode (maxPicks > 1 or requireConfirm): tap up to maxPicks names,
// then confirm; onVote receives an array of ids. Used by the open vote.
export default function VoteGrid({
  players,
  voterId,
  voterName,
  onVote,
  accent,
  maxPicks = 1,
  requireConfirm = false,
  instruction,
  speech,
  onBack,
}) {
  const [voted, setVoted] = useState(false)
  const [picked, setPicked] = useState([])
  const multi = maxPicks > 1 || requireConfirm
  const headingRef = useFocusHeading()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => speak(speech || voteEntryLine(), { delay: 300 }), [])
  useNudge(!voted, { after: 15000 })
  const candidates = players.filter((p) => p.id !== voterId)
  const cols = candidates.length <= 4 ? '1fr' : '1fr 1fr'

  const handleVote = (targetId) => {
    if (voted) return
    if (multi) {
      hapticMedium()
      setPicked((cur) =>
        cur.includes(targetId)
          ? cur.filter((id) => id !== targetId)
          : cur.length < maxPicks
            ? [...cur, targetId]
            : maxPicks === 1
              ? [targetId]
              : cur
      )
      return
    }
    setVoted(true)
    hapticMedium()
    playSound('vote')
    onVote(targetId)
  }

  const confirmPicks = () => {
    if (voted || picked.length === 0) return
    setVoted(true)
    playSound('vote')
    onVote(picked)
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
        ref={headingRef}
        tabIndex={-1}
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
        {instruction || L.vote.instruction}
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
            variant={picked.includes(p.id) ? 'primary' : 'secondary'}
            ariaPressed={multi ? picked.includes(p.id) : undefined}
            size="lg"
            accentColor={accent || colors.textPrimary}
            fullWidth
            disabled={voted}
            onClick={() => handleVote(p.id)}
            style={{
              // Same animation as .anim-stagger; the global reduced-motion rule
              // in index.html now also covers inline animations like this one.
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

      {multi && !voted && (
        <Button
          variant="primary"
          size="lg"
          accentColor={colors.success}
          fullWidth
          disabled={picked.length === 0}
          onClick={confirmPicks}
          style={{ marginTop: spacing.lg }}
        >
          {maxPicks > 1 ? `Zatwierdź (${picked.length}/${maxPicks})` : 'Zatwierdź'}
        </Button>
      )}

      {onBack && !voted && (
        <Button variant="ghost" size="md" fullWidth onClick={onBack} style={{ marginTop: spacing.sm }}>
          Wróć
        </Button>
      )}

      {voted && (
        <div
          role="status"
          className="anim-bounce"
          style={{
            textAlign: 'center',
            marginTop: spacing.lg,
            fontSize: fontSizes.h3,
            fontWeight: fontWeights.black,
            color: colors.success,
          }}
        >
          {L.vote.confirmed}
        </div>
      )}
    </div>
  )
}
