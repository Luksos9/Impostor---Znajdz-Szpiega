import { colors, fonts, fontSizes, fontWeights, spacing } from '../styles/theme'
import Button from './ui/Button'
import Card from './ui/Card'
import SettingToggle from './ui/SettingToggle'
import ThemeToggle from './ui/ThemeToggle'

// In-game settings: mute sounds / narrator or flip the theme without quitting.
// (Before this, the only way to silence the narrator mid-game was to lose the game.)
export default function SettingsSheet({
  soundsEnabled,
  voiceEnabled,
  themeMode,
  onToggleSounds,
  onToggleVoice,
  onToggleTheme,
  onClose,
}) {
  const row = (label, control) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.md,
        padding: `${spacing.xs}px 0`,
      }}
    >
      <span style={{ fontSize: fontSizes.bodyLg, fontWeight: fontWeights.extraBold }}>{label}</span>
      {control}
    </div>
  )

  return (
    <div
      className="anim-enter"
      role="dialog"
      aria-modal="true"
      aria-label="Ustawienia"
      style={{
        position: 'fixed',
        inset: 0,
        background: colors.overlay,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
        fontFamily: fonts.sans,
      }}
      onClick={onClose}
    >
      <Card
        elevation="strong"
        padded="lg"
        style={{ maxWidth: 360 }}
      >
        <div onClick={(e) => e.stopPropagation()}>
          <div
            style={{
              fontSize: fontSizes.h3,
              fontWeight: fontWeights.black,
              marginBottom: spacing.md,
              color: colors.textPrimary,
            }}
          >
            Ustawienia
          </div>
          <div style={{ color: colors.textPrimary, marginBottom: spacing.lg }}>
            {row('Dźwięki', <SettingToggle kind="sound" on={soundsEnabled} onToggle={onToggleSounds} />)}
            {row('Lektor', <SettingToggle kind="voice" on={voiceEnabled} onToggle={onToggleVoice} />)}
            {row('Motyw', <ThemeToggle mode={themeMode} onToggle={onToggleTheme} />)}
          </div>
          <Button variant="primary" size="lg" fullWidth accentColor={colors.textPrimary} textColor={colors.bg} onClick={onClose}>
            Wróć do gry
          </Button>
        </div>
      </Card>
    </div>
  )
}
