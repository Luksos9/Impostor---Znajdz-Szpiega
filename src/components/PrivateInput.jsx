import { useEffect, useId, useRef, useState } from 'react'
import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  spacing,
  radii,
  colorForMode,
  colorForModeShadow,
} from '../styles/theme'
import Button from './ui/Button'

// Pass-and-play textarea. Used by Kto ma inne pytanie? for private answers.
// Clears its internal state whenever `playerName` changes so the previous answer
// never leaks to the next player.
//
// Props:
//   playerName:   string
//   prompt:       string            label above the textarea
//   placeholder:  string
//   modeId:       string            for accent color
//   maxLength:    number            default 80
//   onSubmit:     (text) => void
export default function PrivateInput({
  playerName,
  prompt,
  placeholder,
  modeId,
  maxLength = 80,
  onSubmit,
}) {
  const [text, setText] = useState('')
  const inputRef = useRef(null)
  const reactId = useId()
  const safeId = reactId.replace(/:/g, '')
  const taClass = `private-input-${safeId}`

  // Reset when the player changes so we don't leak the previous answer.
  useEffect(() => {
    setText('')
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [playerName])

  const canSubmit = text.trim().length > 0
  const accent = colorForMode(modeId)
  const accentShadow = colorForModeShadow(modeId)

  // Inline scoped CSS for the textarea focus border (impossible via inline style).
  const taCss = `
    .${taClass} {
      background: ${colors.surface};
      border: 2px solid ${colors.borderStrong};
      border-radius: ${radii.lg}px;
      color: ${colors.textPrimary};
      font-family: ${fonts.sans};
      font-size: ${fontSizes.bodyLg}px;
      font-weight: ${fontWeights.semibold};
      padding: ${spacing.md}px;
      resize: none;
      width: 100%;
      outline: none;
      transition: border-color 120ms ease, box-shadow 120ms ease;
      line-height: 1.4;
    }
    .${taClass}:focus {
      border-color: ${accent};
      box-shadow: 0 0 0 3px ${accent}22;
    }
    .${taClass}::placeholder {
      color: ${colors.textMuted};
      font-weight: ${fontWeights.semibold};
    }
  `

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
        paddingBottom: spacing.xl + 8,
        paddingLeft: spacing.lg,
        paddingRight: spacing.lg,
      }}
    >
      <style>{taCss}</style>

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
        {playerName}
      </div>

      <h2
        style={{
          fontSize: fontSizes.h2,
          fontWeight: fontWeights.black,
          margin: 0,
          marginBottom: spacing.lg,
          letterSpacing: '-0.02em',
          lineHeight: 1.15,
          color: colors.textPrimary,
        }}
      >
        {prompt}
      </h2>

      <textarea
        ref={inputRef}
        className={taClass}
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        rows={4}
        style={{ marginBottom: spacing.sm }}
      />

      <div
        style={{
          fontSize: fontSizes.bodySm,
          color: colors.textMuted,
          alignSelf: 'flex-end',
          marginBottom: spacing.xl,
          fontWeight: fontWeights.bold,
        }}
      >
        {text.length} / {maxLength}
      </div>

      <div style={{ flex: 1 }} />

      <Button
        variant="primary"
        size="lg"
        accentColor={accent}
        shadowColor={accentShadow}
        fullWidth
        disabled={!canSubmit}
        onClick={() => canSubmit && onSubmit(text.trim())}
      >
        Zapisz i oddaj telefon
      </Button>
    </div>
  )
}
