import { useEffect, useRef, useState } from 'react'
import { colors, fonts, fontSizes, fontWeights, spacing, radii, colorForMode } from '../styles/theme'

// Pass-and-play textarea. Used by Kto ma inne pytanie? for private answers.
// Clears its internal state whenever `playerId` changes so the previous answer
// never leaks to the next player.
//
// Props:
//   playerName:   string
//   prompt:       string            label above the textarea
//   placeholder:  string
//   modeId:       string            for accent color
//   maxLength:    number            default 80
//   onSubmit:     (text) => void
export default function PrivateInput({ playerName, prompt, placeholder, modeId, maxLength = 80, onSubmit }) {
  const [text, setText] = useState('')
  const inputRef = useRef(null)

  // Reset when the player changes so we don't leak the previous answer.
  useEffect(() => {
    setText('')
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [playerName])

  const canSubmit = text.trim().length > 0
  const accent = colorForMode(modeId)

  return (
    <div
      style={{
        minHeight: '100vh',
        background: colors.bg,
        color: colors.textPrimary,
        fontFamily: fonts.sans,
        display: 'flex',
        flexDirection: 'column',
        paddingTop: spacing.xl,
        paddingBottom: spacing.lg,
        paddingLeft: spacing.lg,
        paddingRight: spacing.lg,
      }}
    >
      <div
        style={{
          fontSize: fontSizes.eyebrow,
          fontWeight: fontWeights.bold,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: accent,
          marginBottom: spacing.sm,
        }}
      >
        {playerName}
      </div>

      <h2
        style={{
          fontSize: fontSizes.h3,
          fontWeight: fontWeights.bold,
          margin: 0,
          marginBottom: spacing.lg,
          lineHeight: 1.25,
        }}
      >
        {prompt}
      </h2>

      <textarea
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        rows={4}
        style={{
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: radii.lg,
          color: colors.textPrimary,
          fontFamily: fonts.sans,
          fontSize: fontSizes.bodyLg,
          padding: spacing.md,
          resize: 'none',
          marginBottom: spacing.sm,
          width: '100%',
          outline: 'none',
        }}
      />

      <div
        style={{
          fontSize: fontSizes.bodySm,
          color: colors.textMuted,
          alignSelf: 'flex-end',
          marginBottom: spacing.xl,
        }}
      >
        {text.length} / {maxLength}
      </div>

      <div style={{ flex: 1 }} />

      <button
        onClick={() => canSubmit && onSubmit(text.trim())}
        disabled={!canSubmit}
        style={{
          background: canSubmit ? accent : colors.surface,
          border: `2px solid ${canSubmit ? accent : colors.border}`,
          borderRadius: radii.xl,
          color: canSubmit ? colors.bg : colors.textDim,
          fontSize: fontSizes.h3,
          fontWeight: fontWeights.black,
          padding: `${spacing.lg}px 0`,
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          transition: 'transform 0.08s ease',
        }}
      >
        Zapisz i oddaj telefon
      </button>
    </div>
  )
}
