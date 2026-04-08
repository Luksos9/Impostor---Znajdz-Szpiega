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
export default function QuickSetup({ modeId, initialRounds, onBack, onStart }) {
  const mode = getMode(modeId)
  const accent = colorForMode(modeId)
  const accentShadow = colorForModeShadow(modeId)

  const [playerCount, setPlayerCount] = useState(Math.max(mode?.minPlayers || 3, 5))
  const [rounds, setRounds] = useState(initialRounds || 5)
  // Roster lives in state so user edits survive count changes via resizeRoster.
  const [roster, setRoster] = useState(() => autoGeneratePlayers(Math.max(mode?.minPlayers || 3, 5)))
  const [isEditingNames, setIsEditingNames] = useState(false)

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
        minHeight: '100dvh',
        background: colors.bg,
        color: colors.textPrimary,
        fontFamily: fonts.sans,
        display: 'flex',
        flexDirection: 'column',
        paddingTop: spacing.xl,
        paddingBottom: spacing.xl + 8, // breathing room for the tactile Graj shadow
        paddingLeft: spacing.lg,
        paddingRight: spacing.lg,
      }}
    >
      {/* Back link — ghost, mode-agnostic */}
      <div style={{ marginBottom: spacing.lg, alignSelf: 'flex-start' }}>
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
          marginBottom: spacing.xl,
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

      {/* ─── Player roster (funny names + edit) ─── */}
      <div style={{ marginTop: spacing.md, marginBottom: spacing.lg }}>
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
          <div style={{ display: 'flex', gap: spacing.xs }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShuffle}
              ariaLabel={L.quickSetup.shuffleNames}
            >
              ⟳ {L.quickSetup.shuffleNames}
            </Button>
            <Button
              variant={isEditingNames ? 'primary' : 'secondary'}
              size="sm"
              accentColor={accent}
              shadowColor={accentShadow}
              onClick={() => setIsEditingNames((v) => !v)}
            >
              {isEditingNames ? L.quickSetup.doneEditing : L.quickSetup.editNames}
            </Button>
          </div>
        </div>

        {!isEditingNames && (
          <div
            style={{
              fontSize: fontSizes.bodySm,
              color: colors.textMuted,
              marginBottom: spacing.sm,
              fontWeight: fontWeights.semibold,
            }}
          >
            {L.quickSetup.namesHint}
          </div>
        )}

        <Card padded="md" elevation="soft">
          {isEditingNames ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
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
          ) : (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: spacing.sm,
              }}
            >
              {roster.map((p) => (
                <NameChip key={p.id} name={p.name} accent={accent} />
              ))}
            </div>
          )}
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
          marginBottom: spacing.xl,
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

      <div style={{ flex: 1 }} />

      {/* ─── Big tactile Graj button ─── */}
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

// Compact rounded pill that displays a player's funny default name.
function NameChip({ name, accent }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: colors.bgSubtle,
        border: `1.5px solid ${colors.border}`,
        borderRadius: radii.pill,
        padding: `${spacing.xs}px ${spacing.md}px`,
        fontSize: fontSizes.bodySm,
        fontWeight: fontWeights.extraBold,
        color: colors.textPrimary,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: accent,
          marginRight: spacing.sm,
        }}
      />
      {name}
    </span>
  )
}

// Inline editable name input. Number badge on the left, text input on the
// right. Border thickens to the mode accent on focus.
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
          padding: ${spacing.sm}px ${spacing.md}px;
          min-height: 44px;
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
            width: 28,
            height: 28,
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
