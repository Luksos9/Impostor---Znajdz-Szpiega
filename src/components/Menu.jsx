import { useEffect, useState } from 'react'
import { getVoiceStatus } from '../utils/voice'
import { getSettings, saveSettings } from '../utils/storage'
import HowToPlay from './HowToPlay'
import InstallHint from './InstallHint'
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
import SettingToggle from './ui/SettingToggle'
import Button from './ui/Button'

// Iconic dark-navy badge illustrations hand-picked by the user. The dark
// bleed edge blends into the card background so each tile reads as part of
// the card rather than a pasted sticker. WebP at ~2x display size (the
// original 1 MB PNGs were being precached on first install).
const MODE_IMAGES = {
  classic: '/images/classic.webp',
  pairsQuestion: '/images/questions.webp',
  kameleon: '/images/kameleon.webp',
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
export default function Menu({
  onPickMode,
  themeMode = 'light',
  onToggleTheme,
  soundsEnabled = true,
  voiceEnabled = true,
  onToggleSounds,
  onToggleVoice,
  resume = null,
  onResume,
}) {
  // Voices load late on phones; re-check for a few seconds before judging.
  const [voiceStatus, setVoiceStatus] = useState(() => getVoiceStatus())
  useEffect(() => {
    let tries = 0
    const timer = setInterval(() => {
      setVoiceStatus(getVoiceStatus())
      if (++tries >= 8) clearInterval(timer)
    }, 700)
    return () => clearInterval(timer)
  }, [])

  // Rules: shown once on first launch, then from the "?" button.
  const [howOpen, setHowOpen] = useState(() => !getSettings().seenHowTo)
  const closeHow = () => {
    saveSettings({ seenHowTo: true })
    setHowOpen(false)
  }

  // Invite friends: native share sheet on phones, clipboard elsewhere.
  const [shareNote, setShareNote] = useState('')
  const share = async () => {
    const url = window.location.origin
    const data = { title: 'Impostor', text: 'Zagraj ze mną w Impostora — gra imprezowa na jeden telefon!', url }
    try {
      if (navigator.share) {
        await navigator.share(data)
        return
      }
      await navigator.clipboard.writeText(url)
      setShareNote('Link skopiowany')
    } catch (err) {
      if (err?.name === 'AbortError') return // user closed the share sheet
      setShareNote(url)
    }
    setTimeout(() => setShareNote(''), 2500)
  }

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
        paddingTop: spacing.lg,
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
        {/* Settings row: sound + narrator on the left, theme on the right. */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: spacing.md,
          }}
        >
          <div style={{ display: 'flex', gap: spacing.sm }}>
            {onToggleSounds && (
              <SettingToggle kind="sound" on={soundsEnabled} onToggle={onToggleSounds} />
            )}
            {onToggleVoice && (
              <SettingToggle kind="voice" on={voiceEnabled} onToggle={onToggleVoice} />
            )}
            <button
              type="button"
              onClick={() => setHowOpen(true)}
              aria-label="Jak grać?"
              title="Jak grać?"
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                border: `2px solid ${colors.borderStrong}`,
                background: colors.surface,
                color: colors.textPrimary,
                fontFamily: fonts.sans,
                fontSize: fontSizes.bodyLg,
                fontWeight: fontWeights.black,
                cursor: 'pointer',
                boxShadow: '0 4px 0 var(--shadow-tactile-neutral)',
              }}
            >
              ?
            </button>
          </div>
          {onToggleTheme && <ThemeToggle mode={themeMode} onToggle={onToggleTheme} />}
        </div>

        {voiceEnabled && voiceStatus === 'no-polish' && (
          <div
            role="note"
            style={{
              marginBottom: spacing.md,
              padding: `${spacing.sm}px ${spacing.md}px`,
              borderRadius: radii.md,
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              fontSize: fontSizes.bodySm,
              color: colors.textSecondary,
              fontWeight: fontWeights.semibold,
              lineHeight: 1.35,
            }}
          >
            Ten telefon nie ma polskiego głosu, więc lektor może brzmieć dziwnie. Na iPhonie dodasz go w
            Ustawienia → Dostępność → Treść czytana → Głosy.
          </div>
        )}

        <header
          style={{
            textAlign: 'center',
            marginBottom: spacing.xl,
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

        <InstallHint />

        {resume && (
          <div className="anim-bounce" style={{ marginBottom: spacing.lg }}>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              accentColor={colors.success}
              shadowColor={colors.successShadow}
              onClick={onResume}
            >
              Wznów grę · runda {resume.round}/{resume.total}
            </Button>
            <div
              style={{
                textAlign: 'center',
                marginTop: spacing.xs,
                fontSize: fontSizes.bodySm,
                color: colors.textMuted,
                fontWeight: fontWeights.bold,
              }}
            >
              {resume.modeLabel} · wynik zachowany, runda zaczyna się od nowa
            </div>
          </div>
        )}

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

        <div style={{ marginTop: spacing.xl, textAlign: 'center' }}>
          <Button variant="ghost" size="md" onClick={share}>
            Zaproś znajomych
          </Button>
          <div role="status" style={{ minHeight: 20, fontSize: fontSizes.bodySm, color: colors.textSecondary, fontWeight: fontWeights.bold }}>
            {shareNote}
          </div>
        </div>

        <div
          style={{
            marginTop: spacing.md,
            textAlign: 'center',
            fontSize: fontSizes.eyebrow,
            color: colors.textMuted,
            fontWeight: fontWeights.bold,
          }}
        >
          v{__APP_VERSION__}
        </div>
      </div>
      {howOpen && <HowToPlay onClose={closeHow} />}
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
