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

// Display order for the menu cards. Kept local to the Menu component because
// the rest of the app uses MODE_REGISTRY purely by id, so the registry
// stays the single source of truth for metadata while the menu decides
// what the player sees first.
const MENU_ORDER = ['classic', 'kameleon', 'pairsQuestion']

// Subtle detective atmosphere — bowler hat + eye mask silhouettes tiled at
// very low opacity behind the cards. Inline SVG as a data URI so the
// pattern ships with the JS bundle and never needs a separate asset.
const SILHOUETTE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220"><g fill="rgba(255,255,255,0.055)"><path d="M30 40 L30 30 Q30 16 46 16 Q62 16 62 30 L62 40 L68 40 Q70 40 70 42 L70 44 L22 44 L22 42 Q22 40 24 40 Z"/><path d="M130 138 L186 138 Q192 138 192 144 L192 152 Q190 160 180 160 L168 160 L162 168 L157 160 L146 160 Q136 160 132 152 L132 144 Q132 138 138 138 Z"/><circle cx="160" cy="60" r="9" fill="none" stroke="rgba(255,255,255,0.055)" stroke-width="2"/><line x1="167" y1="67" x2="176" y2="76" stroke="rgba(255,255,255,0.055)" stroke-width="2"/></g></svg>`
const SILHOUETTE_URL = `url("data:image/svg+xml;utf8,${encodeURIComponent(SILHOUETTE_SVG)}")`

// Menu — always-dark gaming shell with neon-glow mode cards.
//
// Overrides the theme for visual impact: the rest of the app follows the
// user's light/dark toggle, but the Menu is hardcoded deep-black + neon
// so the illustrations pop like badges. Horizontal layout, illustration
// fills the left edge of each card, text stacks on the right. All three
// cards share the same size — "hero" status is communicated only through
// the "TRYB GŁÓWNY" eyebrow, not a bigger footprint.
//
// Content is clamped to a centered ~560px column so desktop doesn't
// stretch the cards into thin strips.
export default function Menu({ onPickMode, themeMode = 'light', onToggleTheme }) {
  const ordered = MENU_ORDER
    .map((id) => MODE_REGISTRY.find((m) => m.id === id))
    .filter(Boolean)

  return (
    <div
      className="anim-enter"
      style={{
        minHeight: '100dvh',
        background: '#030303',
        color: '#FFFFFF',
        fontFamily: fonts.sans,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: spacing.xxl,
        paddingBottom: spacing.xl,
        paddingLeft: spacing.md,
        paddingRight: spacing.md,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background atmosphere — colored bokeh orbs behind the cards.
          Each radial gradient leaks the mode accent across the page so
          the cards look like they're glowing onto the environment. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `
            radial-gradient(circle at 22% 28%, rgba(239, 68, 68, 0.22), transparent 42%),
            radial-gradient(circle at 78% 50%, rgba(16, 185, 129, 0.20), transparent 44%),
            radial-gradient(circle at 30% 82%, rgba(59, 130, 246, 0.22), transparent 44%)
          `,
        }}
      />

      {/* Subtle detective silhouette pattern — bowler hats, eye masks,
          magnifying glasses at very low opacity, tiled across the page. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: SILHOUETTE_URL,
          backgroundSize: '220px 220px',
          backgroundRepeat: 'repeat',
          opacity: 0.9,
        }}
      />

      {/* Theme toggle — absolute top-right so it never displaces the header. */}
      {onToggleTheme && (
        <div
          style={{
            position: 'absolute',
            top: spacing.lg,
            right: spacing.lg,
            zIndex: 3,
          }}
        >
          <ThemeToggle mode={themeMode} onToggle={onToggleTheme} />
        </div>
      )}

      {/* Content column — clamped to 560px so desktop doesn't stretch cards
          into awkward strips. zIndex:1 keeps text above the bokeh/silhouette. */}
      <div
        style={{
          width: '100%',
          maxWidth: 560,
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
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
              textShadow: '0 0 24px rgba(255,255,255,0.22)',
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
    </div>
  )
}

// NeonModeCard — pressable card with a big glowing accent border.
// Illustration fills the full height of the left edge (flush to the
// rounded corner), text block stacks on the right. All three cards share
// the same dimensions; "hero" shows a mode-colored "TRYB GŁÓWNY" eyebrow.
function NeonModeCard({ mode, onClick, imageSrc }) {
  const accent = colorForMode(mode.id)
  const className = `neon-card-${mode.id}`
  const isHero = mode.rank === 'hero'
  // Card border is 2px, so illustration corner radius = outer radius - 2
  // to sit flush inside the border without showing a corner notch.
  const innerRadius = radii.xxl - 2

  return (
    <button type="button" onClick={onClick} className={className}>
      <style>{`
        .${className} {
          background: #0B0B0B;
          border: 2px solid ${accent};
          border-radius: ${radii.xxl}px;
          padding: 0;
          color: #FFFFFF;
          text-align: left;
          cursor: pointer;
          box-shadow:
            0 0 0 1px ${accent}66,
            0 0 26px -2px ${accent}CC,
            0 0 60px -6px ${accent}99,
            0 0 110px -12px ${accent}66,
            inset 0 0 28px -8px ${accent}88;
          transform: translateY(0);
          transition: transform 120ms ease, box-shadow 220ms ease;
          position: relative;
          overflow: hidden;
          width: 100%;
          font-family: inherit;
          min-height: 168px;
          display: flex;
          align-items: stretch;
        }
        .${className}:hover {
          box-shadow:
            0 0 0 2px ${accent}99,
            0 0 34px -2px ${accent}E6,
            0 0 76px -6px ${accent}B3,
            0 0 140px -12px ${accent}80,
            inset 0 0 36px -8px ${accent}99;
        }
        .${className}:active {
          transform: translateY(2px);
        }
        .${className}:focus-visible {
          outline: none;
          box-shadow:
            0 0 0 3px ${accent},
            0 0 40px -2px ${accent}FF,
            0 0 80px -4px ${accent}CC,
            inset 0 0 36px -8px ${accent}99;
        }
      `}</style>

      {/* Illustration — fills full card height on the left, corners
          rounded to match the card's inner edge. */}
      {imageSrc && (
        <div
          style={{
            width: 168,
            alignSelf: 'stretch',
            flexShrink: 0,
            borderTopLeftRadius: innerRadius,
            borderBottomLeftRadius: innerRadius,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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

      {/* Text block — right side, flexes to fill remaining space. */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingTop: spacing.md,
          paddingBottom: spacing.md,
          paddingLeft: spacing.md,
          paddingRight: spacing.lg,
        }}
      >
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
            fontSize: fontSizes.h3,
            fontWeight: fontWeights.black,
            lineHeight: 1.1,
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
            color: 'rgba(255,255,255,0.62)',
            lineHeight: 1.35,
            fontWeight: fontWeights.semibold,
          }}
        >
          {mode.blurb}
        </div>
      </div>
    </button>
  )
}
