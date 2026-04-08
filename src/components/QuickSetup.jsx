import { useEffect, useState } from 'react'
import { colors, fonts, fontSizes, fontWeights, spacing, radii, colorForMode } from '../styles/theme'
import { L, t } from '../utils/labels'
import { getMode } from '../data/modes'
import { autoGeneratePlayers, validateRoster } from '../utils/players'

// QuickSetup: three taps from app open to first round.
// User picks player count + round count, taps Graj.
// Auto-names Gracz 1..N are already assigned before this screen mounts.
export default function QuickSetup({ modeId, initialRounds, onBack, onStart }) {
  const mode = getMode(modeId)
  const [playerCount, setPlayerCount] = useState(Math.max(mode?.minPlayers || 3, 5))
  const [rounds, setRounds] = useState(initialRounds || 5)

  // If the user picks a count below the mode's minimum, bump it up.
  useEffect(() => {
    if (mode && playerCount < mode.minPlayers) {
      setPlayerCount(mode.minPlayers)
    }
  }, [modeId, mode, playerCount])

  const players = autoGeneratePlayers(playerCount)
  const validation = validateRoster(players)
  const meetsMin = playerCount >= (mode?.minPlayers || 3)
  const canStart = validation.ok && meetsMin

  const countOptions = [3, 4, 5, 6, 7, 8]

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
      <button
        onClick={onBack}
        style={{
          background: 'transparent',
          border: 'none',
          color: colors.textMuted,
          fontSize: fontSizes.bodySm,
          fontWeight: fontWeights.semibold,
          padding: 0,
          marginBottom: spacing.xl,
          alignSelf: 'flex-start',
          cursor: 'pointer',
        }}
      >
        ← {L.buttons.back}
      </button>

      <div
        style={{
          fontSize: fontSizes.eyebrow,
          fontWeight: fontWeights.bold,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: colorForMode(modeId),
          marginBottom: spacing.sm,
        }}
      >
        {mode?.label}
      </div>

      <h2
        style={{
          fontSize: fontSizes.h2,
          fontWeight: fontWeights.black,
          margin: 0,
          marginBottom: spacing.xl,
          letterSpacing: '-0.01em',
        }}
      >
        {L.quickSetup.title}
      </h2>

      {/* Player count picker */}
      <div
        style={{
          fontSize: fontSizes.eyebrow,
          fontWeight: fontWeights.semibold,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: colors.textMuted,
          marginBottom: spacing.sm,
        }}
      >
        {L.quickSetup.playerCount}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: spacing.sm,
          marginBottom: spacing.lg,
        }}
      >
        {countOptions.map((count) => {
          const disabled = count < (mode?.minPlayers || 3)
          const active = playerCount === count
          return (
            <button
              key={count}
              onClick={() => !disabled && setPlayerCount(count)}
              disabled={disabled}
              style={{
                background: active ? colorForMode(modeId) : colors.surface,
                border: `1px solid ${active ? colorForMode(modeId) : colors.border}`,
                borderRadius: radii.md,
                color: active ? colors.bg : (disabled ? colors.textDim : colors.textPrimary),
                fontSize: fontSizes.bodyLg,
                fontWeight: fontWeights.bold,
                padding: `${spacing.md}px 0`,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.4 : 1,
                transition: 'background 0.12s ease, color 0.12s ease',
              }}
            >
              {count}
            </button>
          )
        })}
      </div>

      {!meetsMin && mode && (
        <div
          style={{
            fontSize: fontSizes.bodySm,
            color: colors.scoreRed,
            marginBottom: spacing.md,
          }}
        >
          {t(L.quickSetup.minPlayers, { n: mode.minPlayers })}
        </div>
      )}

      {/* Round count stepper */}
      <div
        style={{
          fontSize: fontSizes.eyebrow,
          fontWeight: fontWeights.semibold,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: colors.textMuted,
          marginBottom: spacing.sm,
          marginTop: spacing.md,
        }}
      >
        {L.quickSetup.roundCount}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing.md,
          marginBottom: spacing.xl,
        }}
      >
        <button
          onClick={() => setRounds(Math.max(3, rounds - 1))}
          disabled={rounds <= 3}
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.md,
            color: colors.textPrimary,
            fontSize: fontSizes.h3,
            fontWeight: fontWeights.bold,
            width: 56,
            height: 56,
            cursor: rounds <= 3 ? 'not-allowed' : 'pointer',
            opacity: rounds <= 3 ? 0.4 : 1,
          }}
        >
          −
        </button>
        <div
          style={{
            fontSize: fontSizes.h1,
            fontWeight: fontWeights.black,
            minWidth: 80,
            textAlign: 'center',
          }}
        >
          {rounds}
        </div>
        <button
          onClick={() => setRounds(Math.min(10, rounds + 1))}
          disabled={rounds >= 10}
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.md,
            color: colors.textPrimary,
            fontSize: fontSizes.h3,
            fontWeight: fontWeights.bold,
            width: 56,
            height: 56,
            cursor: rounds >= 10 ? 'not-allowed' : 'pointer',
            opacity: rounds >= 10 ? 0.4 : 1,
          }}
        >
          +
        </button>
      </div>

      <div style={{ flex: 1 }} />

      {/* Big Graj button */}
      <button
        onClick={() => canStart && onStart(players, rounds)}
        disabled={!canStart}
        style={{
          background: canStart ? colorForMode(modeId) : colors.surface,
          border: `2px solid ${canStart ? colorForMode(modeId) : colors.border}`,
          borderRadius: radii.xl,
          color: canStart ? colors.bg : colors.textDim,
          fontSize: fontSizes.h2,
          fontWeight: fontWeights.black,
          padding: `${spacing.lg}px 0`,
          cursor: canStart ? 'pointer' : 'not-allowed',
          transition: 'transform 0.08s ease',
          letterSpacing: '-0.01em',
        }}
        onMouseOver={(e) => { if (canStart) e.currentTarget.style.transform = 'scale(1.01)' }}
        onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
      >
        {L.quickSetup.start}
      </button>
    </div>
  )
}
