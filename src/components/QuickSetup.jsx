import { useEffect, useMemo, useState } from 'react'
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
} from '../styles/theme'
import { L, t } from '../utils/labels'
import { getMode } from '../data/modes'
import {
  autoGeneratePlayers,
  resizeRoster,
  renamePlayer,
  validateRoster,
} from '../utils/players'
import Button from './ui/Button'
import Card from './ui/Card'

// QuickSetup: three taps from app open to first round.
// User picks player count + round count, optionally edits names, taps Graj.
// Roster starts as funny Polish nicknames; user can edit or re-shuffle.
// Layout: scrollable middle (title → count → names → rounds) with a pinned
// Graj footer so the CTA is always visible even when the name list grows.
export default function QuickSetup({ modeId, initialRounds, onBack, onStart }) {
  const mode = getMode(modeId)
  const accent = colorForMode(modeId)
  const accentShadow = colorForModeShadow(modeId)

  const [playerCount, setPlayerCount] = useState(Math.max(mode?.minPlayers || 3, 5))
  const [rounds, setRounds] = useState(initialRounds || 5)
  // Roster lives in state so user edits survive count changes via resizeRoster.
  const [roster, setRoster] = useState(() => autoGeneratePlayers(Math.max(mode?.minPlayers || 3, 5)))

  // If the user picks a count below the mode's minimum, bump it up.
  useEffect(() => {
    if (mode && playerCount < mode.minPlayers) {
      setPlayerCount(mode.minPlayers)
    }
  }, [modeId, mode, playerCount])

  // Keep roster sized to playerCount, preserving existing names where possible.
  useEffect(() => {
    setRoster((current) => resizeRoster(current, playerCount))
  }, [playerCount])

  const validation = validateRoster(roster)
  const meetsMin = playerCount >= (mode?.minPlayers || 3)
  const canStart = validation.ok && meetsMin

  const countOptions = useMemo(() => [3, 4, 5, 6, 7, 8], [])

  const handleShuffle = () => {
    setRoster(autoGeneratePlayers(playerCount))
  }

  const handleRename = (id, value) => {
    setRoster((current) => renamePlayer(current, id, value))
  }

  return (
    <div
      className="anim-enter"
      style={{
        height: '100dvh',
        background: colors.bg,
        color: colors.textPrimary,
        fontFamily: fonts.sans,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Scrollable middle — everything except the pinned Graj footer. */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          paddingTop: spacing.lg,
          paddingLeft: spacing.lg,
          paddingRight: spacing.lg,
          paddingBottom: spacing.md,
        }}
      >
        {/* Back link — ghost, mode-agnostic */}
        <div style={{ marginBottom: spacing.md, alignSelf: 'flex-start' }}>
          <Button variant="ghost" size="sm" onClick={onBack} ariaLabel={L.buttons.back}>
            ← {L.buttons.back}
          </Button>
        </div>

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
          {mode?.label}
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
          {L.quickSetup.title}
        </h2>

        {/* ─── Player count picker ─── */}
        <SectionLabel>{L.quickSetup.playerCount}</SectionLabel>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: spacing.sm,
            marginBottom: spacing.md,
          }}
        >
          {countOptions.map((count) => {
            const disabled = count < (mode?.minPlayers || 3)
            const active = playerCount === count
            return (
              <CountCell
                key={count}
                label={count}
                active={active}
                disabled={disabled}
                accent={accent}
                accentShadow={accentShadow}
                onClick={() => !disabled && setPlayerCount(count)}
              />
            )
          })}
        </div>

        {!meetsMin && mode && (
          <div
            style={{
              fontSize: fontSizes.bodySm,
              color: colors.danger,
              marginBottom: spacing.md,
              fontWeight: fontWeights.bold,
            }}
          >
            {t(L.quickSetup.minPlayers, { n: mode.minPlayers })}
          </div>
        )}

        {/* ─── Player roster (always editable, numbered rows) ─── */}
        <div style={{ marginTop: spacing.sm, marginBottom: spacing.md }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: spacing.sm,
              gap: spacing.sm,
            }}
          >
            <SectionLabel inline>{L.quickSetup.namesLabel}</SectionLabel>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShuffle}
              ariaLabel={L.quickSetup.shuffleNames}
            >
              ⟳ {L.quickSetup.shuffleNames}
            </Button>
          </div>

          <Card padded="sm" elevation="soft">
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
              {roster.map((p, idx) => (
                <NameInput
                  key={p.id}
                  index={idx}
                  value={p.name}
                  accent={accent}
                  onChange={(value) => handleRename(p.id, value)}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* ─── Round count stepper ─── */}
        <SectionLabel>{L.quickSetup.roundCount}</SectionLabel>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.lg,
          }}
        >
          <Button
            variant="secondary"
            size="md"
            accentColor={accent}
            onClick={() => setRounds(Math.max(3, rounds - 1))}
            disabled={rounds <= 3}
            ariaLabel="−"
            style={{
              width: 56,
              paddingLeft: 0,
              paddingRight: 0,
              fontSize: fontSizes.h2,
            }}
          >
            −
          </Button>
          <div
            style={{
              fontSize: fontSizes.h1,
              fontWeight: fontWeights.black,
              minWidth: 80,
              textAlign: 'center',
              color: colors.textPrimary,
              letterSpacing: '-0.02em',
            }}
          >
            {rounds}
          </div>
          <Button
            variant="secondary"
            size="md"
            accentColor={accent}
            onClick={() => setRounds(Math.min(10, rounds + 1))}
            disabled={rounds >= 10}
            ariaLabel="+"
            style={{
              width: 56,
              paddingLeft: 0,
              paddingRight: 0,
              fontSize: fontSizes.h2,
            }}
          >
            +
          </Button>
        </div>
      </div>

      {/* ─── Pinned Graj footer — always visible, never scrolls away. ─── */}
      <div
        style={{
          flexShrink: 0,
          paddingTop: spacing.md,
          paddingLeft: spacing.lg,
          paddingRight: spacing.lg,
          paddingBottom: spacing.lg + 8, // breathing room for the tactile shadow
          background: colors.bg,
          borderTop: `1px solid ${colors.border}`,
        }}
      >
        <Button
          variant="primary"
          size="hero"
          accentColor={accent}
          shadowColor={accentShadow}
          fullWidth
          disabled={!canStart}
          onClick={() => canStart && onStart(roster, rounds)}
        >
          {L.quickSetup.start}
        </Button>
      </div>
    </div>
  )
}

// ─── Subcomponents ───────────────────────────────────────────────────────────

function SectionLabel({ children, inline = false }) {
  return (
    <div
      style={{
        fontSize: fontSizes.eyebrow,
        fontWeight: fontWeights.extraBold,
        textTransform: 'uppercase',
        letterSpacing: '0.14em',
        color: colors.textMuted,
        marginBottom: inline ? 0 : spacing.sm,
      }}
    >
      {children}
    </div>
  )
}

// Tactile player count button. Active = filled with the mode accent and a
// chunky under-shadow. Idle = white card with neutral border.
function CountCell({ label, active, disabled, accent, accentShadow, onClick }) {
  const className = `count-cell-${label}`
  const bg = active ? accent : colors.surface
  const color = active ? '#FFFFFF' : disabled ? colors.textDim : colors.textPrimary
  const border = active
    ? `2px solid ${accent}`
    : `2px solid ${colors.border}`
  const boxShadow = disabled
    ? 'none'
    : active
      ? `0 4px 0 ${accentShadow}`
      : shadows.tactile

  return (
    <>
      <style>{`
        .${className} {
          background: ${bg};
          border: ${border};
          border-radius: ${radii.lg}px;
          color: ${color};
          font-family: ${fonts.sans};
          font-size: ${fontSizes.bodyLg}px;
          font-weight: ${fontWeights.black};
          padding: ${spacing.sm}px 0;
          min-height: 52px;
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          opacity: ${disabled ? 0.4 : 1};
          box-shadow: ${boxShadow};
          transform: translateY(0);
          transition: transform 90ms ease, box-shadow 90ms ease, background 160ms ease, color 160ms ease;
        }
        .${className}:active:not(:disabled) {
          transform: translateY(4px);
          box-shadow: 0 0 0 transparent;
        }
        .${className}:focus-visible {
          outline: none;
          box-shadow: ${boxShadow}, 0 0 0 3px rgba(43, 43, 43, 0.18);
        }
      `}</style>
      <button
        type="button"
        className={className}
        onClick={onClick}
        disabled={disabled}
      >
        {label}
      </button>
    </>
  )
}

// Inline editable name input. Number badge on the left, text input on the
// right. Border thickens to the mode accent on focus.
// Kept compact (40px row) so 5–8 players fit on a mid-size phone.
function NameInput({ index, value, accent, onChange }) {
  const className = `name-input-${index}`
  return (
    <>
      <style>{`
        .${className} {
          flex: 1;
          background: ${colors.surface};
          border: 2px solid ${colors.border};
          border-radius: ${radii.md}px;
          color: ${colors.textPrimary};
          font-family: ${fonts.sans};
          font-size: ${fontSizes.body}px;
          font-weight: ${fontWeights.bold};
          padding: ${spacing.xs}px ${spacing.md}px;
          min-height: 40px;
          outline: none;
          transition: border-color 120ms ease, box-shadow 120ms ease;
        }
        .${className}:focus {
          border-color: ${accent};
          box-shadow: 0 0 0 3px ${accent}22;
        }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
        <span
          aria-hidden="true"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: accent,
            color: '#FFFFFF',
            fontSize: fontSizes.bodySm,
            fontWeight: fontWeights.black,
            flexShrink: 0,
          }}
        >
          {index + 1}
        </span>
        <input
          type="text"
          className={className}
          value={value}
          maxLength={20}
          onChange={(e) => onChange(e.target.value)}
          placeholder={L.quickSetup.namePlaceholder}
          aria-label={`${L.quickSetup.namePlaceholder} ${index + 1}`}
        />
      </div>
    </>
  )
}
