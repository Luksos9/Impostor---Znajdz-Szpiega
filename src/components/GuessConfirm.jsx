import { useEffect } from 'react'
import { colors, fonts, fontSizes, fontWeights, spacing } from '../styles/theme'
import Button from './ui/Button'
import { speak } from '../utils/voice'
import { guessConfirmLine } from '../utils/narration'
import { useFocusHeading } from '../utils/useFocusHeading'

// "Are you sure?" gate before an impostor guess. A guess ends the round, so a
// mis-tap or a prank must be recoverable. Shown to the whole table, so it never
// names anyone — the hand-off afterwards is anonymous too.
export default function GuessConfirm({ eyebrow, who = 'impostor', accent, shadowColor, onConfirm, onBack }) {
  const headingRef = useFocusHeading()
  useEffect(() => speak(guessConfirmLine()), [])

  return (
    <div
      className="anim-enter"
      style={{
        flex: 1,
        minHeight: 0,
        background: colors.bg,
        color: colors.textPrimary,
        fontFamily: fonts.sans,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingTop: spacing.xl,
        paddingBottom: spacing.xl + 8,
        paddingLeft: spacing.lg,
        paddingRight: spacing.lg,
      }}
    >
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
        {eyebrow}
      </div>
      <h2
        ref={headingRef}
        tabIndex={-1}
        style={{
          fontSize: fontSizes.h1,
          fontWeight: fontWeights.black,
          margin: 0,
          marginBottom: spacing.md,
          letterSpacing: '-0.02em',
        }}
      >
        Na pewno?
      </h2>
      <p
        style={{
          fontSize: fontSizes.bodyLg,
          color: colors.textSecondary,
          margin: 0,
          marginBottom: spacing.xl,
          lineHeight: 1.4,
          fontWeight: fontWeights.semibold,
        }}
      >
        Zgadywanie kończy rundę. Telefon powinien wziąć tylko {who}.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
        <Button
          variant="primary"
          size="lg"
          accentColor={accent}
          shadowColor={shadowColor}
          fullWidth
          onClick={onConfirm}
        >
          Tak, zgadujemy
        </Button>
        <Button variant="ghost" size="md" fullWidth onClick={onBack}>
          Wróć
        </Button>
      </div>
    </div>
  )
}
