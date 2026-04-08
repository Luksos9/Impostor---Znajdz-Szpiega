import { useState } from 'react'
import { colors, fonts, fontSizes, fontWeights, spacing, radii, colorForRole } from '../styles/theme'
import { L } from '../utils/labels'

// Secret card reveal with two-tap hide confirmation.
// First tap on "Już pamiętam" hides the secret and shows "Schowane, tap to pass".
// Second tap advances to whatever's next (usually next player or next phase).
//
// Props:
//   role:    'civilian' | 'impostor'       controls the accent and the "You are ..." label
//   label:   'Twoje słowo' etc.            label shown above the main secret
//   secret:  'PIZZA' or 'Jesteś impostorem' the actual secret content
//   hint:    optional subline (category for Klasyczny, hint for impostor)
//   accent:  hex color                      mode accent used for the border
//   onHide:  called after the second tap
export default function CardReveal({ role, label, secret, hint, accent, onHide }) {
  const [hidden, setHidden] = useState(false)
  const roleColor = colorForRole(role)

  const handleFirstTap = () => setHidden(true)
  const handleSecondTap = () => onHide && onHide()

  return (
    <div
      style={{
        minHeight: '100vh',
        background: colors.bg,
        color: colors.textPrimary,
        fontFamily: fonts.sans,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
      }}
    >
      {!hidden ? (
        <>
          <div
            style={{
              fontSize: fontSizes.eyebrow,
              fontWeight: fontWeights.bold,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: roleColor,
              marginBottom: spacing.md,
            }}
          >
            {role === 'impostor' ? (secret === L.card.youAreChameleon ? 'Kameleon' : 'Impostor') : label}
          </div>

          <div
            style={{
              background: colors.surface,
              border: `3px solid ${accent || roleColor}`,
              borderRadius: radii.xl,
              padding: `${spacing.xxl}px ${spacing.lg}px`,
              marginBottom: spacing.xl,
              minWidth: 280,
              maxWidth: 420,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: role === 'impostor' ? fontSizes.h1 : fontSizes.h1,
                fontWeight: fontWeights.black,
                letterSpacing: '-0.01em',
                lineHeight: 1.1,
                marginBottom: hint ? spacing.md : 0,
                wordBreak: 'break-word',
              }}
            >
              {secret}
            </div>
            {hint && (
              <div
                style={{
                  fontSize: fontSizes.body,
                  color: colors.textSecondary,
                  marginTop: spacing.sm,
                }}
              >
                {hint}
              </div>
            )}
          </div>

          <button
            onClick={handleFirstTap}
            style={{
              background: colors.surface,
              border: `1px solid ${colors.borderStrong}`,
              borderRadius: radii.lg,
              color: colors.textPrimary,
              fontSize: fontSizes.body,
              fontWeight: fontWeights.bold,
              padding: `${spacing.md}px ${spacing.xl}px`,
              cursor: 'pointer',
              minWidth: 240,
            }}
          >
            {L.card.rememberIt}
          </button>
        </>
      ) : (
        <button
          onClick={handleSecondTap}
          style={{
            background: 'transparent',
            border: `2px dashed ${colors.border}`,
            borderRadius: radii.xl,
            color: colors.textMuted,
            fontSize: fontSizes.bodyLg,
            fontWeight: fontWeights.bold,
            padding: `${spacing.xxl}px ${spacing.xl}px`,
            cursor: 'pointer',
            minWidth: 320,
            maxWidth: 420,
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          {L.card.hiddenConfirm}
        </button>
      )}
    </div>
  )
}
