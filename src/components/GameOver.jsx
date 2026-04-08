import { colors, fonts, fontSizes, fontWeights, spacing, tactileShadow } from '../styles/theme'
import { L } from '../utils/labels'
import Button from './ui/Button'
import Card from './ui/Card'

// Final standings after the last round.
// Players sorted by score descending. Winners get a celebrated success row.
export default function GameOver({ players, scores, onRestart, onMenu }) {
  const sorted = [...players].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0))
  const topScore = sorted.length > 0 ? scores[sorted[0].id] || 0 : 0
  const winners = sorted.filter((p) => (scores[p.id] || 0) === topScore)

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
          marginBottom: spacing.lg,
          letterSpacing: '-0.02em',
          color: colors.textPrimary,
        }}
      >
        {winners.length === 1 ? L.gameOver.winner : L.gameOver.winners}
      </h2>

      {/* Winner card(s) — celebrated treatment with success border + tactile success shadow */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.sm,
          marginBottom: spacing.xl,
        }}
      >
        {winners.map((p, idx) => (
          <Card
            key={p.id}
            elevation="strong"
            padded="none"
            border="none"
            className="anim-pop"
            style={{
              border: `4px solid ${colors.success}`,
              boxShadow: `${tactileShadow(colors.successShadow)}, 0 18px 40px var(--shadow-strong)`,
              padding: `${spacing.lg}px ${spacing.lg}px`,
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              animationDelay: `${idx * 100}ms`,
            }}
          >
            <span
              style={{
                fontSize: fontSizes.h1,
                fontWeight: fontWeights.black,
                letterSpacing: '-0.02em',
                color: colors.textPrimary,
                lineHeight: 1.05,
              }}
            >
              {p.name}
            </span>
            <span
              style={{
                fontSize: fontSizes.h1,
                fontWeight: fontWeights.black,
                color: colors.success,
                letterSpacing: '-0.02em',
                lineHeight: 1.05,
              }}
            >
              {scores[p.id] || 0}
            </span>
          </Card>
        ))}
      </div>

      <div
        style={{
          fontSize: fontSizes.eyebrow,
          fontWeight: fontWeights.extraBold,
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: colors.textMuted,
          marginBottom: spacing.sm,
        }}
      >
        Wynik końcowy
      </div>

      {/* Full ranking — borderless rows on cream with 1px bottom dividers */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: spacing.xl,
        }}
      >
        {sorted.map((p, idx) => {
          const score = scores[p.id] || 0
          const isWinner = winners.some((w) => w.id === p.id)
          const isLast = idx === sorted.length - 1
          return (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                padding: `${spacing.md}px ${spacing.sm}px`,
                borderBottom: isLast ? 'none' : `1px solid ${colors.border}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: spacing.md }}>
                <span
                  style={{
                    fontSize: fontSizes.body,
                    color: colors.textMuted,
                    fontWeight: fontWeights.extraBold,
                    minWidth: 24,
                  }}
                >
                  {idx + 1}.
                </span>
                <span
                  style={{
                    fontSize: fontSizes.bodyLg,
                    fontWeight: isWinner ? fontWeights.black : fontWeights.extraBold,
                    color: colors.textPrimary,
                  }}
                >
                  {p.name}
                </span>
              </div>
              <span
                style={{
                  fontSize: fontSizes.bodyLg,
                  fontWeight: fontWeights.black,
                  color: isWinner ? colors.success : colors.textPrimary,
                }}
              >
                {score}
              </span>
            </div>
          )
        })}
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
        <Button
          variant="primary"
          size="hero"
          accentColor={colors.success}
          shadowColor={colors.successShadow}
          fullWidth
          onClick={onRestart}
        >
          {L.gameOver.playAgain}
        </Button>
        <Button variant="ghost" size="md" fullWidth onClick={onMenu}>
          {L.gameOver.backToMenu}
        </Button>
      </div>
    </div>
  )
}
