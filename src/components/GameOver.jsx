import { useEffect, useMemo } from 'react'
import { colors, fonts, fontSizes, fontWeights, spacing, tactileShadow } from '../styles/theme'
import { L } from '../utils/labels'
import Button from './ui/Button'
import Card from './ui/Card'
import { hapticSuccess } from '../utils/haptics'
import { playSound } from '../utils/sounds'

const CONFETTI_COLORS = ['#ef4444', '#3b82f6', '#10b981', '#F5A623', '#A855F7', '#EC4899', '#FFFFFF']

// Final standings after the last round.
// Players sorted by score descending. Winners get a celebrated success row.
export default function GameOver({ players, scores, onRestart, onMenu }) {
  useEffect(() => {
    hapticSuccess()
    playSound('celebrate')
  }, [])

  const sorted = [...players].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0))
  const topScore = sorted.length > 0 ? scores[sorted[0].id] || 0 : 0
  const winners = sorted.filter((p) => (scores[p.id] || 0) === topScore)

  const confetti = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: `${Math.random() * 1.5}s`,
      duration: `${2 + Math.random() * 1.5}s`,
      size: 8 + Math.random() * 8,
      rotation: Math.random() * 360,
      round: i % 3 === 0,
    })), [])

  return (
    <div
      className="anim-enter"
      style={{
        position: 'relative',
        overflow: 'hidden',
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
        maxWidth: 480,
        width: '100%',
        margin: '0 auto',
      }}
    >
      {/* Confetti burst */}
      {confetti.map((c) => (
        <span
          key={c.id}
          className="anim-confetti"
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: -12,
            left: c.left,
            width: c.size,
            height: c.round ? c.size : c.size * 1.4,
            background: c.color,
            borderRadius: c.round ? '50%' : 2,
            animationDelay: c.delay,
            animationDuration: c.duration,
            transform: `rotate(${c.rotation}deg)`,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
      ))}

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
            className="anim-bounce-glow"
            style={{
              border: `4px solid ${colors.success}`,
              boxShadow: `${tactileShadow(colors.successShadow)}, 0 18px 40px var(--shadow-strong)`,
              padding: `${spacing.lg}px ${spacing.lg}px`,
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              '--bounce-delay': `${idx * 100}ms`,
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
              className="anim-stagger"
              style={{
                animationDelay: `${300 + idx * 60}ms`,
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
