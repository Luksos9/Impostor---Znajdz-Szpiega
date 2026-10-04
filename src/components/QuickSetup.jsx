import { useMemo, useState } from 'react'
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
import { getSavedNames } from '../utils/storage'
import {
  MAX_PLAYERS,
  emptyRoster,
  resizeRoster,
  renamePlayer,
  finalizeRoster,
  validateRoster,
  maxImpostors,
} from '../utils/players'
import { playSound } from '../utils/sounds'
import Button from './ui/Button'
import Card from './ui/Card'

// QuickSetup: pick player count, type the names, choose impostors + rounds, go.
// Names are always typed by the group (no random nicknames) but remembered
// from the previous game, so a returning group just taps Graj.
// Layout: scrollable middle with a pinned Graj footer so the CTA never hides.
export default function QuickSetup({
  modeId,
  initialRounds,
  initialImpostors = 1,
  onBack,
  onStart,
}) {
  const mode = getMode(modeId)
  const accent = colorForMode(modeId)
  const accentShadow = colorForModeShadow(modeId)
  const multiImpostor = !!mode?.multiImpostor
  const minPlayers = mode?.minPlayers || 3

  const [savedNames] = useState(() => getSavedNames())
  const [playerCount, setPlayerCount] = useState(() =>
    Math.max(minPlayers, Math.min(MAX_PLAYERS, savedNames.length || 5))
  )
  const [rounds, setRounds] = useState(initialRounds || 5)
  const [impostors, setImpostors] = useState(initialImpostors)
  const [roster, setRoster] = useState(() =>
    emptyRoster(Math.max(minPlayers, Math.min(MAX_PLAYERS, savedNames.length || 5)), savedNames)
  )

  // Impostor count can never exceed what the lobby allows.
  const impostorCap = multiImpostor ? maxImpostors(playerCount) : 1
  const impostorsEffective = Math.min(impostors, impostorCap)

  // First launch: open the keyboard on the first empty field so typing starts at once.
  const autoFocusIdx = savedNames.length === 0 ? 0 : -1

  const validation = validateRoster(roster)
  const meetsMin = playerCount >= minPlayers
  const canStart = validation.ok && meetsMin

  // 3..10 players.
  const countOptions = useMemo(() => Array.from({ length: MAX_PLAYERS - 2 }, (_, i) => i + 3), [])

  const handleRename = (id, value) => {
    setRoster((current) => renamePlayer(current, id, value))
  }

  // Enter hops to the next name field; on the last one it closes the keyboard.
  const focusNext = (index) => {
    const next = document.getElementById(`name-input-${index + 1}`)
    if (next) next.focus()
    else document.activeElement?.blur()
  }

  const start = () => {
    if (!canStart) return
    playSound('roundEnd')
    onStart(finalizeRoster(roster), rounds, impostorsEffective)
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
        maxWidth: 480,
        width: '100%',
        margin: '0 auto',
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

        {/* ─── Player count ─── */}
        <SectionLabel>{L.quickSetup.playerCount}</SectionLabel>
        <div
          style={{
            display: 'grid',
            // 8 options: two rows of 4 keeps each button a comfortable tap target.
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: spacing.sm,
            marginBottom: spacing.lg,
          }}
        >
          {countOptions.map((count) => {
            const disabled = count < minPlayers
            return (
              <CountCell
                key={count}
                label={count}
                active={playerCount === count}
                disabled={disabled}
                accent={accent}
                accentShadow={accentShadow}
                onClick={() => {
                  if (disabled) return
                  playSound('pop')
                  setPlayerCount(count)
                  // Resize the roster right here, keeping the names already typed.
                  setRoster((current) => resizeRoster(current, count))
                }}
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
            {t(L.quickSetup.minPlayers, { n: minPlayers })}
          </div>
        )}

        {/* ─── Names: always typed, remembered between games ─── */}
        <SectionLabel>{L.quickSetup.namesLabel}</SectionLabel>
        <Card padded="sm" elevation="soft" style={{ marginBottom: spacing.lg }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
            {roster.map((p, idx) => (
              <NameInput
                key={p.id}
                index={idx}
                total={roster.length}
                value={p.name}
                accent={accent}
                autoFocus={idx === autoFocusIdx}
                onChange={(value) => handleRename(p.id, value)}
                onEnter={() => focusNext(idx)}
              />
            ))}
          </div>
        </Card>

        {/* ─── Impostors + rounds, side by side to save height ─── */}
        <div style={{ display: 'flex', gap: spacing.md }}>
          {multiImpostor && (
            <div style={{ flex: 1 }}>
              <SectionLabel>{L.quickSetup.impostorCount}</SectionLabel>
              <Stepper
                value={impostorsEffective}
                min={1}
                max={impostorCap}
                accent={accent}
                onChange={setImpostors}
                label="impostorów"
              />
            </div>
          )}
          <div style={{ flex: 1 }}>
            <SectionLabel>{L.quickSetup.roundCount}</SectionLabel>
            <Stepper
              value={rounds}
              min={3}
              max={10}
              accent={accent}
              onChange={setRounds}
              label="rund"
            />
          </div>
        </div>
      </div>

      {/* ─── Pinned footer ─── */}
      <div
        style={{
          flexShrink: 0,
          paddingTop: spacing.sm,
          paddingLeft: spacing.lg,
          paddingRight: spacing.lg,
          paddingBottom: spacing.lg + 8,
          background: colors.bg,
          borderTop: `1px solid ${colors.border}`,
        }}
      >
        <div
          aria-live="polite"
          style={{
            minHeight: 22,
            textAlign: 'center',
            marginBottom: spacing.xs,
            fontSize: fontSizes.bodySm,
            fontWeight: fontWeights.bold,
            color: colors.textMuted,
          }}
        >
          {!validation.ok && meetsMin ? validation.error : ''}
        </div>
        <Button
          variant="primary"
          size="hero"
          accentColor={accent}
          shadowColor={accentShadow}
          fullWidth
          disabled={!canStart}
          soundKey="pop"
          onClick={start}
        >
          {L.quickSetup.start}
        </Button>
      </div>
    </div>
  )
}

// ─── Subcomponents ───────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
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
      {children}
    </div>
  )
}

// − 3 + stepper. Compact (44px) so two of them fit on one row.
function Stepper({ value, min, max, accent, onChange, label }) {
  const atMin = value <= min
  const atMax = value >= max
  const btn = {
    width: 44,
    minHeight: 44,
    paddingLeft: 0,
    paddingRight: 0,
    fontSize: fontSizes.h3,
  }
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.sm,
      }}
    >
      <Button
        variant="secondary"
        size="md"
        accentColor={accent}
        soundKey="step"
        disabled={atMin}
        ariaLabel={`Mniej ${label}`}
        onClick={() => onChange(Math.max(min, value - 1))}
        style={btn}
      >
        −
      </Button>
      <div
        key={value}
        className="anim-pop"
        style={{
          fontSize: fontSizes.h1,
          fontWeight: fontWeights.black,
          minWidth: 40,
          textAlign: 'center',
          color: colors.textPrimary,
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </div>
      <Button
        variant="secondary"
        size="md"
        accentColor={accent}
        soundKey="step"
        disabled={atMax}
        ariaLabel={`Więcej ${label}`}
        onClick={() => onChange(Math.min(max, value + 1))}
        style={btn}
      >
        +
      </Button>
    </div>
  )
}

// Tactile player count button. Active = filled with the mode accent.
function CountCell({ label, active, disabled, accent, accentShadow, onClick }) {
  const className = `count-cell-${label}`
  const bg = active ? accent : colors.surface
  const color = active ? '#FFFFFF' : disabled ? colors.textDim : colors.textPrimary
  const border = active ? `2px solid ${accent}` : `2px solid ${colors.border}`
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
          box-shadow: ${boxShadow}, 0 0 0 3px var(--focus-ring);
        }
      `}</style>
      <button type="button" className={className} onClick={onClick} disabled={disabled}>
        {label}
      </button>
    </>
  )
}

// Name field: numbered badge + text input. Enter jumps to the next field.
function NameInput({ index, total, value, accent, autoFocus, onChange, onEnter }) {
  const className = `name-input-${index}`
  return (
    <>
      <style>{`
        .${className} {
          flex: 1;
          min-width: 0;
          background: ${colors.surface};
          border: 2px solid ${colors.border};
          border-radius: ${radii.md}px;
          color: ${colors.textPrimary};
          font-family: ${fonts.sans};
          font-size: ${fontSizes.body}px;
          font-weight: ${fontWeights.bold};
          padding: ${spacing.xs}px ${spacing.md}px;
          min-height: 44px;
          outline: none;
          user-select: text;
          transition: border-color 120ms ease, box-shadow 120ms ease;
        }
        .${className}::placeholder {
          color: ${colors.textMuted};
          font-weight: ${fontWeights.semibold};
        }
        .${className}:focus {
          border-color: ${accent};
          box-shadow: 0 0 0 3px ${accent}33;
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
            background: value.trim() ? accent : colors.border,
            color: value.trim() ? '#FFFFFF' : colors.textMuted,
            fontSize: fontSizes.bodySm,
            fontWeight: fontWeights.black,
            flexShrink: 0,
            transition: 'background 160ms ease, color 160ms ease',
          }}
        >
          {index + 1}
        </span>
        <input
          id={`name-input-${index}`}
          type="text"
          className={className}
          value={value}
          maxLength={14}
          autoFocus={autoFocus}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="words"
          spellCheck={false}
          enterKeyHint={index === total - 1 ? 'done' : 'next'}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onEnter()
            }
          }}
          placeholder={`Gracz ${index + 1}`}
          aria-label={`${L.quickSetup.namePlaceholder} ${index + 1}`}
        />
      </div>
    </>
  )
}
