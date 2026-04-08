import { colors, fonts, fontSizes, fontWeights, spacing, radii, colorForRole } from '../styles/theme'
import { L } from '../utils/labels'

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
export default function RoundResult({ impostorIds, players, deltas, narrative, isLastRound, onNext }) {
  const impostors = players.filter((p) => impostorIds.includes(p.id))
  const others = players.filter((p) => !impostorIds.includes(p.id))

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
          <div
            key={p.id}
            style={{
              background: colors.surface,
              border: `2px solid ${colorForRole('impostor')}`,
              borderRadius: radii.lg,
              padding: `${spacing.md}px ${spacing.lg}px`,
              fontSize: fontSizes.h2,
              fontWeight: fontWeights.black,
              letterSpacing: '-0.01em',
            }}
          >
            {p.name}
          </div>
        ))}
      </div>

      {narrative && (
        <div
          style={{
            fontSize: fontSizes.bodyLg,
            color: colors.textSecondary,
            marginBottom: spacing.xl,
            lineHeight: 1.4,
          }}
        >
          {narrative}
        </div>
      )}

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
        {players.map((p) => {
          const delta = deltas[p.id] || 0
          const isImp = impostorIds.includes(p.id)
          const deltaColor =
            delta > 0 ? colors.scoreGreen : delta < 0 ? colors.scoreRed : colors.textMuted
          return (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: colors.surface,
                border: `1px solid ${isImp ? colorForRole('impostor') : colors.border}`,
                borderRadius: radii.md,
                padding: `${spacing.md}px ${spacing.lg}px`,
              }}
            >
              <div
                style={{
                  fontSize: fontSizes.bodyLg,
                  fontWeight: fontWeights.semibold,
                }}
              >
                {p.name}
              </div>
              <div
                style={{
                  fontSize: fontSizes.bodyLg,
                  fontWeight: fontWeights.black,
                  color: deltaColor,
                }}
              >
                {delta > 0 ? `+${delta}` : delta}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ flex: 1 }} />

      <button
        onClick={onNext}
        style={{
          background: colors.textPrimary,
          border: 'none',
          borderRadius: radii.xl,
          color: colors.bg,
          fontSize: fontSizes.h3,
          fontWeight: fontWeights.black,
          padding: `${spacing.lg}px 0`,
          cursor: 'pointer',
          transition: 'transform 0.08s ease',
        }}
        onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.01)' }}
        onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
      >
        {isLastRound ? L.result.finalResults : L.result.next}
      </button>

      {/* Reference to prevent unused-var lint warnings if others is empty. */}
      <div style={{ display: 'none' }}>{others.length}</div>
    </div>
  )
}
