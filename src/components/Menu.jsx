import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  spacing,
  radii,
  colorForMode,
} from '../styles/theme'
import { L } from '../utils/labels'
import { MODE_REGISTRY } from '../data/modes'
import ThemeToggle from './ui/ThemeToggle'

// Iconic dark-navy badge illustrations hand-picked by the user. The dark
// bleed edge blends into the card background so each tile reads as part of
// the card rather than a pasted sticker. spy_in_town.png is staged on disk
// for a future Szpieg mode — not yet wired into MODE_REGISTRY.
const MODE_IMAGES = {
  classic: '/images/classic.png',
  pairsQuestion: '/images/questions.png',
  kameleon: '/images/kameleon.png',
}

// Menu — always-dark gaming shell with neon-glow mode cards.
//
// Overrides the theme for visual impact: the rest of the app follows the
// user's light/dark toggle, but the Menu is hardcoded deep-black + neon
// so the illustrations pop like badges. Horizontal layout, illustration
// on the left, title + blurb on the right. All three cards share the
// same size — "hero" status is communicated only through the
// "TRYB GŁÓWNY" eyebrow, not through a bigger footprint.
export default function Menu({ onPickMode, themeMode = 'light', onToggleTheme }) {
  const hero = MODE_REGISTRY.find((m) => m.rank === 'hero')
  const secondaries = MODE_REGISTRY.filter((m) => m.rank === 'secondary')
  const ordered = hero ? [hero, ...secondaries] : secondaries

  return (
    <div
      className="anim-enter"
      style={{
        minHeight: '100dvh',
        background: '#070707',
        color: '#FFFFFF',
        fontFamily: fonts.sans,
        display: 'flex',
        flexDirection: 'column',
        paddingTop: spacing.xxl,
        paddingBottom: spacing.xl,
        paddingLeft: spacing.lg,
        paddingRight: spacing.lg,
        position: 'relative',
        // Subtle radial vignette so the cards glow against a slightly darker edge.
        backgroundImage:
          'radial-gradient(ellipse at center top, rgba(255,255,255,0.035) 0%, rgba(7,7,7,0) 55%)',
      }}
    >
      {/* Theme toggle — absolute top-right so it never displaces the header. */}
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
            color: 'rgba(255,255,255,0.55)',
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
            color: '#FFFFFF',
            textShadow: '0 0 22px rgba(255,255,255,0.18)',
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
          color: 'rgba(255,255,255,0.45)',
          marginBottom: spacing.md,
          textAlign: 'center',
        }}
      >
        {L.menu.chooseMode}
      </div>

      {/* Three equal-size neon cards stacked vertically. */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.lg,
        }}
      >
        {ordered.map((m) => (
          <NeonModeCard
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

// NeonModeCard — full-width pressable card with a glowing accent border.
// Illustration on the left, text block on the right. All three cards share
// the same dimensions; "hero" shows a mode-colored "TRYB GŁÓWNY" eyebrow.
function NeonModeCard({ mode, onClick, imageSrc }) {
  const accent = colorForMode(mode.id)
  const className = `neon-card-${mode.id}`
  const isHero = mode.rank === 'hero'

  return (
    <button type="button" onClick={onClick} className={className}>
      <style>{`
        .${className} {
          background: #0E0E0E;
          border: 2px solid ${accent};
          border-radius: ${radii.xxl}px;
          padding: 0;
          color: #FFFFFF;
          text-align: left;
          cursor: pointer;
          box-shadow:
            0 0 0 1px ${accent}55,
            0 0 22px -2px ${accent}B3,
            0 0 44px -6px ${accent}80,
            inset 0 0 20px -6px ${accent}55;
          transform: translateY(0);
          transition: transform 120ms ease, box-shadow 220ms ease;
          position: relative;
          overflow: hidden;
          width: 100%;
          font-family: inherit;
          min-height: 150px;
        }
        .${className}:hover {
          box-shadow:
            0 0 0 2px ${accent}88,
            0 0 30px -2px ${accent}CC,
            0 0 60px -6px ${accent}99,
            inset 0 0 26px -6px ${accent}99;
        }
        .${className}:active {
          transform: translateY(2px);
        }
        .${className}:focus-visible {
          outline: none;
          box-shadow:
            0 0 0 3px ${accent},
            0 0 34px -2px ${accent}E6,
            0 0 60px -4px ${accent}B3,
            inset 0 0 26px -6px ${accent}99;
        }
      `}</style>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing.md,
          paddingTop: spacing.md,
          paddingBottom: spacing.md,
          paddingLeft: spacing.md,
          paddingRight: spacing.lg,
        }}
      >
        {imageSrc && (
          <div
            style={{
              width: 118,
              height: 118,
              flexShrink: 0,
              borderRadius: radii.xl,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
            }}
          >
            <img
              src={imageSrc}
              alt=""
              aria-hidden="true"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          {isHero && (
            <div
              style={{
                fontSize: fontSizes.eyebrow,
                fontWeight: fontWeights.extraBold,
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: accent,
                marginBottom: spacing.xs,
              }}
            >
              Tryb główny
            </div>
          )}
          <div
            style={{
              fontSize: fontSizes.h2,
              fontWeight: fontWeights.black,
              lineHeight: 1.05,
              marginBottom: spacing.xs,
              letterSpacing: '-0.02em',
              color: '#FFFFFF',
            }}
          >
            {mode.label}
          </div>
          <div
            style={{
              fontSize: fontSizes.bodySm,
              color: 'rgba(255,255,255,0.65)',
              lineHeight: 1.35,
              fontWeight: fontWeights.semibold,
            }}
          >
            {mode.blurb}
          </div>
        </div>
      </div>
    </button>
  )
}
