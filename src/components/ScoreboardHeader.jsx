import { useState } from 'react'
import { colors, fonts, fontSizes, fontWeights, spacing, radii } from '../styles/theme'
import { L, t } from '../utils/labels'

// Persistent strip at the top of every in-game screen.
// Shows round counter, each player as a chip with their score, and a Wyjdź button
// that opens a confirmation before quitting.
export default function ScoreboardHeader({ players, scores, currentRound, totalRounds, onQuit }) {
  const [confirming, setConfirming] = useState(false)

  return (
    <div
      style={{
        background: colors.surfaceSubtle,
        borderBottom: `1px solid ${colors.border}`,
        padding: `${spacing.sm}px ${spacing.md}px`,
        fontFamily: fonts.sans,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.sm,
        }}
      >
        <div
          style={{
            fontSize: fontSizes.eyebrow,
            fontWeight: fontWeights.bold,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: colors.textMuted,
          }}
        >
          {t(L.scoreboard.round, { n: currentRound + 1, total: totalRounds })}
        </div>
        <button
          onClick={() => setConfirming(true)}
          style={{
            background: 'transparent',
            border: `1px solid ${colors.border}`,
            borderRadius: radii.md,
            color: colors.textSecondary,
            fontSize: fontSizes.bodySm,
            fontWeight: fontWeights.semibold,
            padding: `${spacing.xs}px ${spacing.sm}px`,
            cursor: 'pointer',
          }}
        >
          {L.scoreboard.quit}
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          gap: spacing.xs,
          flexWrap: 'wrap',
        }}
      >
        {players.map((p) => {
          const score = scores[p.id] || 0
          return (
            <div
              key={p.id}
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: radii.pill,
                padding: `${spacing.xs}px ${spacing.sm}px`,
                fontSize: fontSizes.bodySm,
                fontWeight: fontWeights.semibold,
                color: colors.textPrimary,
                display: 'inline-flex',
                alignItems: 'center',
                gap: spacing.xs,
              }}
            >
              <span>{p.name}</span>
              <span style={{ color: colors.textMuted }}>·</span>
              <span style={{ color: colors.scoreGreen, fontWeight: fontWeights.bold }}>{score}</span>
            </div>
          )
        })}
      </div>

      {confirming && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: colors.overlay,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.lg,
          }}
        >
          <div
            style={{
              background: colors.surfaceRaised,
              border: `1px solid ${colors.borderStrong}`,
              borderRadius: radii.xl,
              padding: spacing.xl,
              maxWidth: 360,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: fontSizes.bodyLg,
                fontWeight: fontWeights.semibold,
                marginBottom: spacing.xl,
                lineHeight: 1.4,
              }}
            >
              {L.scoreboard.quitConfirm}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
              <button
                onClick={() => { setConfirming(false); onQuit && onQuit() }}
                style={{
                  background: colors.scoreRed,
                  border: 'none',
                  borderRadius: radii.lg,
                  color: colors.textPrimary,
                  fontSize: fontSizes.body,
                  fontWeight: fontWeights.bold,
                  padding: `${spacing.md}px 0`,
                  cursor: 'pointer',
                }}
              >
                {L.scoreboard.quitYes}
              </button>
              <button
                onClick={() => setConfirming(false)}
                style={{
                  background: 'transparent',
                  border: `1px solid ${colors.border}`,
                  borderRadius: radii.lg,
                  color: colors.textPrimary,
                  fontSize: fontSizes.body,
                  fontWeight: fontWeights.semibold,
                  padding: `${spacing.md}px 0`,
                  cursor: 'pointer',
                }}
              >
                {L.scoreboard.quitNo}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
