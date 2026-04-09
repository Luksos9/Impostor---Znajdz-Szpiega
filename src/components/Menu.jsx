import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  spacing,
  radii,
  shadows,
  colorForMode,
  colorForModeShadow,
  tactileShadow,
} from '../styles/theme'
import { L } from '../utils/labels'
import { MODE_REGISTRY } from '../data/modes'
import ThemeToggle from './ui/ThemeToggle'

// Iconic 3D-rendered mode illustrations hand-picked by the user. Dark navy
// backgrounds sit on the cream Card wrappers in Menu as badge-like tiles.
const MODE_IMAGES = {
  classic: '/images/classic.png',
  pairsQuestion: '/images/questions.png',
  kameleon: '/images/kameleon.png',
}

// Menu screen — cream background, chunky white hero card, two secondary cards.
// Hero illustration gently bobs to communicate "the app is alive."
export default function Menu({ onPickMode, themeMode = 'light', onToggleTheme }) {
  const hero = MODE_REGISTRY.find((m) => m.rank === 'hero')
  const secondaries = MODE_REGISTRY.filter((m) => m.rank === 'secondary')

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
        paddingTop: spacing.xxl,
        paddingBottom: spacing.xl,
        paddingLeft: spacing.lg,
        paddingRight: spacing.lg,
        position: 'relative',
      }}
    >
      {/* Theme toggle — absolute top-right so it never displaces the hero. */}
      {onToggleTheme && (
        <div
          style={{
            position: 'absolute',
            top: spacing.lg,
            right: spacing.lg,
            zIndex: 2,
          }}
        >
          <ThemeToggle mode={themeMode} onToggle={onToggleTheme} />
        </div>
      )}

      <header
        style={{
          textAlign: 'center',
          marginBottom: spacing.xl,
          // Inset both sides so the tagline and title can't run under the
          // absolute-positioned ThemeToggle (top-right, 48×48 at spacing.lg).
          paddingLeft: spacing.xxl,
          paddingRight: spacing.xxl,
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
          {L.app.tagline}
        </div>
        <h1
          style={{
            fontSize: fontSizes.h1,
            fontWeight: fontWeights.black,
            margin: 0,
            letterSpacing: '-0.02em',
            color: colors.textPrimary,
          }}
        >
          {L.app.title}
        </h1>
      </header>

      <div
        style={{
          fontSize: fontSizes.eyebrow,
          fontWeight: fontWeights.extraBold,
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: colors.textMuted,
          marginBottom: spacing.md,
          paddingLeft: spacing.xs,
        }}
      >
        {L.menu.chooseMode}
      </div>

      {/* Hero card — full-width white card with chunky tactile under-shadow.
          The mode illustration on the right gently bobs. */}
      {hero && (
        <HeroModeCard
          mode={hero}
          onClick={() => onPickMode(hero.id)}
          imageSrc={MODE_IMAGES[hero.id]}
        />
      )}

      {/* Secondary cards — two side-by-side white cards with their own
          accent stripe and tactile shadow. */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: spacing.md,
          marginTop: spacing.md,
        }}
      >
        {secondaries.map((m) => (
          <SecondaryModeCard
            key={m.id}
            mode={m}
            onClick={() => onPickMode(m.id)}
            imageSrc={MODE_IMAGES[m.id]}
          />
        ))}
      </div>
    </div>
  )
}

// Hero card — large pressable white card with two columns: text on the left,
// bobbing illustration on the right, accent stripe along the top.
function HeroModeCard({ mode, onClick, imageSrc }) {
  const accent = colorForMode(mode.id)
  const accentShadow = colorForModeShadow(mode.id)

  return (
    <button
      type="button"
      onClick={onClick}
      className="hero-card"
      style={{
        background: colors.surface,
        border: `2px solid ${colors.border}`,
        borderRadius: radii.xxl,
        padding: 0,
        marginBottom: spacing.xs,
        color: colors.textPrimary,
        textAlign: 'left',
        cursor: 'pointer',
        boxShadow: tactileShadow(accentShadow),
        transform: 'translateY(0)',
        transition: 'transform 90ms ease, box-shadow 90ms ease',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        fontFamily: 'inherit',
      }}
    >
      <style>{`
        .hero-card:active {
          transform: translateY(4px);
          box-shadow: 0 0 0 transparent;
        }
        .hero-card:focus-visible {
          outline: none;
          box-shadow: ${tactileShadow(accentShadow)}, 0 0 0 4px rgba(43,43,43,0.18);
        }
      `}</style>

      {/* Top accent stripe */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: accent,
        }}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing.md,
          padding: `${spacing.xl}px ${spacing.lg}px ${spacing.lg}px`,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: fontSizes.eyebrow,
              fontWeight: fontWeights.extraBold,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: accent,
              marginBottom: spacing.sm,
            }}
          >
            Tryb główny
          </div>
          <div
            style={{
              fontSize: fontSizes.h2,
              fontWeight: fontWeights.black,
              lineHeight: 1.05,
              marginBottom: spacing.sm,
              letterSpacing: '-0.02em',
              color: colors.textPrimary,
            }}
          >
            {mode.label}
          </div>
          <div
            style={{
              fontSize: fontSizes.body,
              color: colors.textSecondary,
              lineHeight: 1.35,
              fontWeight: fontWeights.semibold,
            }}
          >
            {mode.blurb}
          </div>
        </div>
        {imageSrc && (
          <div
            className="anim-bob"
            style={{
              width: 116,
              height: 116,
              flexShrink: 0,
              borderRadius: radii.xl,
              background: colors.illustrationBg,
              padding: 4,
              boxShadow: shadows.soft,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <img
              src={imageSrc}
              alt=""
              aria-hidden="true"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: radii.lg,
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
        )}
      </div>
    </button>
  )
}

// Secondary card — square-ish pressable white card.
// Top accent stripe, illustration above label, blurb below.
function SecondaryModeCard({ mode, onClick, imageSrc }) {
  const accent = colorForMode(mode.id)
  const accentShadow = colorForModeShadow(mode.id)
  const className = `secondary-card-${mode.id}`

  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      style={{
        background: colors.surface,
        border: `2px solid ${colors.border}`,
        borderRadius: radii.xl,
        padding: 0,
        color: colors.textPrimary,
        textAlign: 'left',
        cursor: 'pointer',
        minHeight: 220,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        boxShadow: tactileShadow(accentShadow),
        transform: 'translateY(0)',
        transition: 'transform 90ms ease, box-shadow 90ms ease',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        fontFamily: 'inherit',
      }}
    >
      <style>{`
        .${className}:active {
          transform: translateY(4px);
          box-shadow: 0 0 0 transparent;
        }
        .${className}:focus-visible {
          outline: none;
          box-shadow: ${tactileShadow(accentShadow)}, 0 0 0 4px rgba(43,43,43,0.18);
        }
      `}</style>

      {/* Top accent stripe */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: accent,
        }}
      />

      <div
        style={{
          paddingTop: spacing.lg,
          paddingBottom: spacing.md,
          paddingLeft: spacing.md,
          paddingRight: spacing.md,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: spacing.sm,
          flex: 1,
        }}
      >
        {imageSrc ? (
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: radii.lg,
              background: colors.illustrationBg,
              padding: 4,
              boxShadow: shadows.soft,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              alignSelf: 'flex-start',
            }}
          >
            <img
              src={imageSrc}
              alt=""
              aria-hidden="true"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: radii.md,
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
        ) : (
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: radii.pill,
              background: accent,
              marginBottom: spacing.xs,
            }}
          />
        )}
        <div
          style={{
            fontSize: fontSizes.bodyLg,
            fontWeight: fontWeights.black,
            lineHeight: 1.15,
            color: colors.textPrimary,
            letterSpacing: '-0.01em',
          }}
        >
          {mode.label}
        </div>
        <div
          style={{
            fontSize: fontSizes.bodySm,
            color: colors.textSecondary,
            lineHeight: 1.35,
            fontWeight: fontWeights.semibold,
            marginTop: 'auto',
          }}
        >
          {mode.blurb}
        </div>
      </div>
    </button>
  )
}
