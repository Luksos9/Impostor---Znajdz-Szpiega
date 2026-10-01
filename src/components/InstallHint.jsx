import { useState } from 'react'
import { colors, fontSizes, fontWeights, spacing, radii } from '../styles/theme'
import Button from './ui/Button'

const KEY = 'imposter.installHintDismissed'

// iPhone Safari has no install prompt, so people never discover that the game
// can live on the home screen (and run full-screen, offline). Show how — once.
function shouldShow() {
  try {
    if (localStorage.getItem(KEY)) return false
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const standalone =
      window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches
    return ios && !standalone
  } catch {
    return false
  }
}

export default function InstallHint() {
  const [visible, setVisible] = useState(shouldShow)
  if (!visible) return null
  const dismiss = () => {
    try { localStorage.setItem(KEY, '1') } catch { /* ignore */ }
    setVisible(false)
  }
  return (
    <div
      role="note"
      style={{
        marginBottom: spacing.md,
        padding: spacing.md,
        borderRadius: radii.lg,
        background: colors.surface,
        border: `2px solid ${colors.border}`,
      }}
    >
      <div style={{ fontSize: fontSizes.body, fontWeight: fontWeights.extraBold, marginBottom: spacing.xs }}>
        Zainstaluj grę na telefonie
      </div>
      <div style={{ fontSize: fontSizes.bodySm, lineHeight: 1.4, color: colors.textSecondary, fontWeight: fontWeights.semibold, marginBottom: spacing.sm }}>
        W Safari stuknij <strong>Udostępnij</strong> (kwadrat ze strzałką), potem{' '}
        <strong>Dodaj do ekranu początkowego</strong>. Gra będzie działać na pełnym ekranie, także bez internetu.
      </div>
      <Button variant="secondary" size="sm" accentColor={colors.textPrimary} onClick={dismiss}>
        Rozumiem
      </Button>
    </div>
  )
}
