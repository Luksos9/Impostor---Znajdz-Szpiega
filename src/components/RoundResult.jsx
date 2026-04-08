import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  spacing,
  colorForRole,
} from '../styles/theme'
import { L } from '../utils/labels'
import Button from './ui/Button'
import Card from './ui/Card'

// Round reveal: shows who was the impostor, delta points per player, narrative line.
// Single "Następna runda" button advances. Last round: button says "Wyniki" instead.
//
// Props:
//   impostorIds: Array<playerId>
//   players:     Array<{ id, name }>
//   deltas:      Record<playerId, number>  (can be negative, usually 0..+3)
//   narrative:   string                    Polish one-liner ("Impostor uciekł" etc.)
//   isLastRound: boolean
//   onNext:      () => void
export default function RoundResult({
  impostorIds,
  players,
  deltas,
  narrative,
  isLastRound,
  onNext,
}) {
  const impostors = players.filter((p) => impostorIds.includes(p.id))
  const impostorColor = colorForRole('impostor')

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
          color: impostorColor,
          marginBottom: spacing.md,
        }}
      >
        {impostorIds.length === 1 ? L.result.impostorWas : 'Impostorami byli'}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.sm,
          marginBottom: spacing.md,
        }}
      >
        {impostors.map((p) => (
          <Card
            key={p.id}
            elevation="strong"
            padded="none"
            border="none"
            accent={impostorColor}
            style={{
              border: `3px solid ${impostorColor}`,
              padding: `${spacing.lg}px ${spacing.lg}px`,
              fontSize: fontSizes.h1,
              fontWeight: fontWeights.black,
              letterSpacing: '-0.02em',
              color: colors.textPrimary,
              lineHeight: 1.05,
            }}
          >
            {p.name}
          </Card>
        ))}
      </div>

      {narrative && (
        <div
          style={{
            fontSize: fontSizes.bodyLg,
            color: colors.textSecondary,
            marginBottom: spacing.xl,
            lineHeight: 1.4,
            fontWeight: fontWeights.semibold,
          }}
        >
          {narrative}
        </div>
      )}

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
        {L.result.pointsThisRound}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.sm,
          marginBottom: spacing.xl,
        }}
      >
        {players.map((p, idx) => {
          const delta = deltas[p.id] || 0
          const isImp = impostorIds.includes(p.id)
          const deltaColor =
            delta > 0
              ? colors.success
              : delta < 0
                ? colors.danger
                : colors.textMuted
          return (
            <Card
              key={p.id}
              elevation="soft"
              padded="md"
              accent={isImp ? impostorColor : null}
              className="anim-pop"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                animationDelay: `${idx * 80}ms`,
              }}
            >
              <div
                style={{
                  fontSize: fontSizes.bodyLg,
                  fontWeight: fontWeights.extraBold,
                  color: colors.textPrimary,
                }}
              >
                {p.name}
              </div>
              <div
                style={{
                  fontSize: fontSizes.h3,
                  fontWeight: fontWeights.black,
                  color: deltaColor,
                  letterSpacing: '-0.01em',
                }}
              >
                {delta > 0 ? `+${delta}` : delta}
              </div>
            </Card>
          )
        })}
      </div>

      <div style={{ flex: 1 }} />

      <Button
        variant="primary"
        size="hero"
        accentColor={colors.textPrimary}
        textColor={colors.bg}
        fullWidth
        onClick={onNext}
      >
        {isLastRound ? L.result.finalResults : L.result.next}
      </Button>
    </div>
  )
}
