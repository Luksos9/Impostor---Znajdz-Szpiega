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


// Menu — theme-aware with accent-colored card borders.
// In dark mode the accent glows pop as neon; in light mode the same
// borders read as vivid stripes on cream surfaces.
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
        background: colors.bg,
        color: colors.textPrimary,
        fontFamily: fonts.sans,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: spacing.xxl,
        paddingBottom: spacing.xxl,
        paddingLeft: spacing.md,
        paddingRight: spacing.md,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background atmosphere — colored bokeh orbs behind the cards. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `
            radial-gradient(circle at 22% 28%, rgba(239, 68, 68, 0.14), transparent 42%),
            radial-gradient(circle at 78% 50%, rgba(16, 185, 129, 0.12), transparent 44%),
            radial-gradient(circle at 30% 82%, rgba(59, 130, 246, 0.14), transparent 44%)
          `,
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
          background: ${colors.surface};
          border: 2px solid ${accent};
          border-radius: ${radii.xxl}px;
          padding: 0;
          color: ${colors.textPrimary};
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
            color: colors.textPrimary,
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
          }}
        >
          {mode.blurb}
        </div>
      </div>
    </button>
  )
}
