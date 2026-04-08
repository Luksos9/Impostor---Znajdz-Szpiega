import { colors, fonts, fontSizes, fontWeights, spacing, radii } from '../styles/theme'
import { L } from '../utils/labels'

// Final standings after the last round.
// Players sorted by score descending. Winners get a highlighted row.
export default function GameOver({ players, scores, onRestart, onMenu }) {
  const sorted = [...players].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0))
  const topScore = sorted.length > 0 ? scores[sorted[0].id] || 0 : 0
  const winners = sorted.filter((p) => (scores[p.id] || 0) === topScore)

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
        {L.gameOver.title}
      </div>

      <h2
        style={{
          fontSize: fontSizes.h1,
          fontWeight: fontWeights.black,
          margin: 0,
          marginBottom: spacing.md,
          letterSpacing: '-0.02em',
        }}
      >
        {winners.length === 1 ? L.gameOver.winner : L.gameOver.winners}
      </h2>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.sm,
          marginBottom: spacing.xl,
        }}
      >
        {winners.map((p) => (
          <div
            key={p.id}
            style={{
              background: colors.surface,
              border: `2px solid ${colors.scoreGreen}`,
              borderRadius: radii.lg,
              padding: `${spacing.md}px ${spacing.lg}px`,
              fontSize: fontSizes.h2,
              fontWeight: fontWeights.black,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <span>{p.name}</span>
            <span style={{ color: colors.scoreGreen }}>{scores[p.id] || 0}</span>
          </div>
        ))}
      </div>

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
        Wynik końcowy
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.sm,
          marginBottom: spacing.xl,
        }}
      >
        {sorted.map((p, idx) => {
          const score = scores[p.id] || 0
          const isWinner = winners.some((w) => w.id === p.id)
          return (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                padding: `${spacing.sm}px ${spacing.md}px`,
                borderBottom: `1px solid ${colors.border}`,
                opacity: isWinner ? 1 : 0.85,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: spacing.md }}>
                <span
                  style={{
                    fontSize: fontSizes.bodySm,
                    color: colors.textMuted,
                    minWidth: 18,
                  }}
                >
                  {idx + 1}.
                </span>
                <span
                  style={{
                    fontSize: fontSizes.bodyLg,
                    fontWeight: isWinner ? fontWeights.bold : fontWeights.semibold,
                  }}
                >
                  {p.name}
                </span>
              </div>
              <span
                style={{
                  fontSize: fontSizes.bodyLg,
                  fontWeight: fontWeights.bold,
                  color: isWinner ? colors.scoreGreen : colors.textPrimary,
                }}
              >
                {score}
              </span>
            </div>
          )
        })}
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
        <button
          onClick={onRestart}
          style={{
            background: colors.textPrimary,
            border: 'none',
            borderRadius: radii.xl,
            color: colors.bg,
            fontSize: fontSizes.h3,
            fontWeight: fontWeights.black,
            padding: `${spacing.lg}px 0`,
            cursor: 'pointer',
          }}
        >
          {L.gameOver.playAgain}
        </button>
        <button
          onClick={onMenu}
          style={{
            background: 'transparent',
            border: `1px solid ${colors.border}`,
            borderRadius: radii.xl,
            color: colors.textPrimary,
            fontSize: fontSizes.body,
            fontWeight: fontWeights.bold,
            padding: `${spacing.md}px 0`,
            cursor: 'pointer',
          }}
        >
          {L.gameOver.backToMenu}
        </button>
      </div>
    </div>
  )
}
