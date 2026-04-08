import { colors, fonts, fontSizes, fontWeights, spacing, radii, colorForMode } from '../styles/theme'
import { L } from '../utils/labels'
import { MODE_REGISTRY } from '../data/modes'

// Illustrations generated via Gemini's Nano Banana Pro 2 (gemini-3-pro-image-preview).
// Match the mode accent colors from theme.js. One-off generation via scripts/generate-images.js.
const MODE_IMAGES = {
  classic: '/images/mode-classic.png',
  pairsQuestion: '/images/mode-pairs-question.png',
  kameleon: '/images/mode-kameleon.png',
}

// Menu screen. Three mode cards.
// Klasyczny impostor renders as a 2x hero card at the top.
// The other two modes render as smaller side-by-side cards below.
export default function Menu({ onPickMode }) {
  const hero = MODE_REGISTRY.find((m) => m.rank === 'hero')
  const secondaries = MODE_REGISTRY.filter((m) => m.rank === 'secondary')

  return (
    <div
      style={{
        minHeight: '100vh',
        background: colors.bg,
        color: colors.textPrimary,
        fontFamily: fonts.sans,
        display: 'flex',
        flexDirection: 'column',
        paddingTop: spacing.xxl,
        paddingBottom: spacing.lg,
        paddingLeft: spacing.lg,
        paddingRight: spacing.lg,
      }}
    >
      <header style={{ textAlign: 'center', marginBottom: spacing.xl }}>
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
          {L.app.tagline}
        </div>
        <h1
          style={{
            fontSize: fontSizes.h1,
            fontWeight: fontWeights.black,
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          {L.app.title}
        </h1>
      </header>

      <div
        style={{
          fontSize: fontSizes.eyebrow,
          fontWeight: fontWeights.semibold,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: colors.textMuted,
          marginBottom: spacing.md,
        }}
      >
        {L.menu.chooseMode}
      </div>

      {/* Hero card */}
      {hero && (
        <button
          onClick={() => onPickMode(hero.id)}
          style={{
            background: colors.surface,
            border: `2px solid ${colorForMode(hero.id)}`,
            borderRadius: radii.xl,
            padding: `${spacing.xl}px ${spacing.lg}px`,
            marginBottom: spacing.md,
            color: colors.textPrimary,
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'transform 0.08s ease',
          }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.01)' }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.lg,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: fontSizes.eyebrow,
                  fontWeight: fontWeights.bold,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: colorForMode(hero.id),
                  marginBottom: spacing.sm,
                }}
              >
                Tryb główny
              </div>
              <div
                style={{
                  fontSize: fontSizes.h2,
                  fontWeight: fontWeights.black,
                  lineHeight: 1.1,
                  marginBottom: spacing.sm,
                  letterSpacing: '-0.01em',
                }}
              >
                {hero.label}
              </div>
              <div
                style={{
                  fontSize: fontSizes.body,
                  color: colors.textSecondary,
                }}
              >
                {hero.blurb}
              </div>
            </div>
            {MODE_IMAGES[hero.id] && (
              <img
                src={MODE_IMAGES[hero.id]}
                alt=""
                aria-hidden="true"
                style={{
                  width: 120,
                  height: 120,
                  flexShrink: 0,
                  borderRadius: radii.lg,
                  objectFit: 'cover',
                }}
              />
            )}
          </div>
        </button>
      )}

      {/* Secondary cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: spacing.md,
        }}
      >
        {secondaries.map((m) => (
          <button
            key={m.id}
            onClick={() => onPickMode(m.id)}
            style={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: radii.lg,
              padding: spacing.lg,
              color: colors.textPrimary,
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'transform 0.08s ease, border-color 0.12s ease',
              minHeight: 140,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.01)'
              e.currentTarget.style.borderColor = colorForMode(m.id)
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.borderColor = colors.border
            }}
          >
            <div>
              {MODE_IMAGES[m.id] ? (
                <img
                  src={MODE_IMAGES[m.id]}
                  alt=""
                  aria-hidden="true"
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: radii.md,
                    objectFit: 'cover',
                    marginBottom: spacing.sm,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: radii.pill,
                    background: colorForMode(m.id),
                    marginBottom: spacing.sm,
                  }}
                />
              )}
              <div
                style={{
                  fontSize: fontSizes.bodyLg,
                  fontWeight: fontWeights.bold,
                  lineHeight: 1.2,
                  marginBottom: spacing.xs,
                }}
              >
                {m.label}
              </div>
            </div>
            <div
              style={{
                fontSize: fontSizes.bodySm,
                color: colors.textSecondary,
                lineHeight: 1.35,
              }}
            >
              {m.blurb}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
