import { useState } from 'react'
import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  spacing,
  radii,
  shadows,
  colorForMode,
} from '../styles/theme'
import { L } from '../utils/labels'
import Button from './ui/Button'
import Card from './ui/Card'
import ProgressDots from './ui/ProgressDots'
import SettingsSheet from './SettingsSheet'

// Persistent strip at the top of every in-game screen.
// Shows a ProgressDots round indicator, each player as a chip with their score,
// and a Wyjdź button that opens a chunky confirmation modal before quitting.
export default function ScoreboardHeader({
  players,
  scores,
  currentRound,
  totalRounds,
  modeId,
  onQuit,
  settings,
  onToggleSetting,
  onToggleTheme,
}) {
  const [confirming, setConfirming] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const accent = colorForMode(modeId)

  return (
    <div
      style={{
        background: colors.bgSubtle,
        borderBottom: `1px solid ${colors.border}`,
        padding: `${spacing.xs}px ${spacing.md}px`,
        fontFamily: fonts.sans,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.xs,
        }}
      >
        <ProgressDots
          current={currentRound}
          total={totalRounds}
          accentColor={accent}
          size="sm"
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
        {settings && (
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Ustawienia"
            title="Ustawienia"
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: `2px solid ${colors.border}`,
              background: colors.surface,
              color: colors.textSecondary,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
              <circle cx="9" cy="7" r="2" fill="currentColor" />
              <circle cx="15" cy="12" r="2" fill="currentColor" />
              <circle cx="8" cy="17" r="2" fill="currentColor" />
            </svg>
          </button>
        )}
        <Button
          variant="secondary"
          size="sm"
          accentColor={colors.danger}
          shadowColor={colors.dangerShadow}
          onClick={() => setConfirming(true)}
          style={{
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {L.scoreboard.quit}
        </Button>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: spacing.xs,
          flexWrap: 'wrap',
        }}
      >
        {players.map((p, idx) => {
          const score = scores[p.id] || 0
          return (
            <div
              key={p.id}
              className="anim-stagger"
              style={{
                animationDelay: `${idx * 40}ms`,
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: radii.pill,
                boxShadow: shadows.soft,
                padding: `2px ${spacing.md}px`,
                fontSize: fontSizes.bodySm,
                color: colors.textPrimary,
                display: 'inline-flex',
                alignItems: 'center',
                gap: spacing.sm,
              }}
            >
              <span
                style={{
                  fontWeight: fontWeights.extraBold,
                  maxWidth: 100,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {p.name}
              </span>
              <span
                style={{
                  color: colors.success,
                  fontWeight: fontWeights.black,
                  fontSize: fontSizes.body,
                }}
              >
                {score}
              </span>
            </div>
          )
        })}
      </div>

      {settingsOpen && settings && (
        <SettingsSheet
          soundsEnabled={settings.soundsEnabled}
          voiceEnabled={settings.voiceEnabled}
          themeMode={settings.themeMode}
          onToggleSounds={() => onToggleSetting('soundsEnabled')}
          onToggleVoice={() => onToggleSetting('voiceEnabled')}
          spicyMode={settings.spicyMode}
          onToggleSpicy={() => onToggleSetting('spicyMode')}
          onToggleTheme={onToggleTheme}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {confirming && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: colors.overlay,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.lg,
          }}
          className="anim-enter"
        >
          <Card
            elevation="strong"
            padded="lg"
            style={{
              maxWidth: 360,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: fontSizes.bodyLg,
                fontWeight: fontWeights.extraBold,
                marginBottom: spacing.xl,
                lineHeight: 1.4,
                color: colors.textPrimary,
              }}
            >
              {L.scoreboard.quitConfirm}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
              <Button
                variant="primary"
                size="lg"
                accentColor={colors.danger}
                shadowColor={colors.dangerShadow}
                fullWidth
                onClick={() => {
                  setConfirming(false)
                  onQuit && onQuit()
                }}
              >
                {L.scoreboard.quitYes}
              </Button>
              <Button
                variant="secondary"
                size="md"
                fullWidth
                onClick={() => setConfirming(false)}
              >
                {L.scoreboard.quitNo}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
