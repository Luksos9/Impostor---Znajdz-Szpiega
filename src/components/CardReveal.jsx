import { useState } from 'react'
import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  spacing,
  radii,
  shadows,
  colorForRole,
} from '../styles/theme'
import { L } from '../utils/labels'
import Card from './ui/Card'
import Button from './ui/Button'

// Secret card reveal with two-tap hide confirmation.
// First tap on "Już pamiętam" hides the secret and shows "Schowane, tap to pass".
// Second tap advances to whatever's next (usually next player or next phase).
//
// Props:
//   role:    'civilian' | 'impostor'       controls the role color + label
//   label:   'Twoje słowo' etc.            label shown above the main secret
//   secret:  'PIZZA' or 'Jesteś impostorem' the actual secret content
//   hint:    optional subline (category for Klasyczny, hint for impostor)
//   accent:  hex color                      mode accent used for the secondary CTA
//   onHide:  called after the second tap
export default function CardReveal({ role, label, secret, hint, accent, onHide }) {
  const [hidden, setHidden] = useState(false)
  const roleColor = colorForRole(role)

  const handleFirstTap = () => setHidden(true)
  const handleSecondTap = () => onHide && onHide()

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
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: spacing.lg,
        paddingLeft: spacing.lg,
        paddingRight: spacing.lg,
        paddingBottom: spacing.xl + 8,
      }}
    >
      {!hidden ? (
        <>
          <div
            style={{
              fontSize: fontSizes.eyebrow,
              fontWeight: fontWeights.extraBold,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: roleColor,
              marginBottom: spacing.md,
            }}
          >
            {role === 'impostor'
              ? secret === L.card.youAreChameleon
                ? 'Kameleon'
                : 'Impostor'
              : label}
          </div>

          <Card
            elevation="strong"
            padded="none"
            border="none"
            style={{
              border: `4px solid ${roleColor}`,
              padding: `${spacing.xxl}px ${spacing.lg}px`,
              marginBottom: spacing.xl,
              minWidth: 280,
              maxWidth: 420,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: fontSizes.h1,
                fontWeight: fontWeights.black,
                letterSpacing: '-0.01em',
                lineHeight: 1.1,
                marginBottom: hint ? spacing.md : 0,
                wordBreak: 'break-word',
                color: colors.textPrimary,
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
                  fontWeight: fontWeights.semibold,
                }}
              >
                {hint}
              </div>
            )}
          </Card>

          <Button
            variant="secondary"
            size="lg"
            accentColor={accent || roleColor}
            onClick={handleFirstTap}
            style={{ minWidth: 240 }}
          >
            {L.card.rememberIt}
          </Button>
        </>
      ) : (
        <Button
          variant="dashed"
          size="lg"
          fullWidth
          onClick={handleSecondTap}
          style={{
            maxWidth: 360,
            minHeight: 140,
            padding: spacing.xl,
            lineHeight: 1.4,
          }}
        >
          {L.card.hiddenConfirm}
        </Button>
      )}
    </div>
  )
}
