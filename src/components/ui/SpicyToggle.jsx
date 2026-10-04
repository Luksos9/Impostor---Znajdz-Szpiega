import { useId, useState } from 'react'
import { colors, shadows, radii, fonts, fontSizes, fontWeights, spacing } from '../../styles/theme'
import Button from './Button'
import Card from './Card'

// "+18" round button: switches the swearing narrator ("Tryb +18") on and off.
// Turning it ON always asks first, because the lines are vulgar; turning it
// off is instant. Matches SettingToggle's size so it sits in the same row.
export default function SpicyToggle({ on = false, onToggle }) {
  const reactId = useId()
  const className = `spicy-toggle-${reactId.replace(/:/g, '')}`
  const [asking, setAsking] = useState(false)
  const label = `Tryb +18: ${on ? 'włączony' : 'wyłączony'}`

  return (
    <>
      <style>{`
        .${className} {
          width: 48px;
          height: 48px;
          border-radius: ${radii.pill}px;
          background: ${on ? colors.danger : colors.surface};
          border: 2px solid ${on ? colors.danger : colors.border};
          color: ${on ? '#FFFFFF' : colors.textMuted};
          font-family: ${fonts.sans};
          font-size: 15px;
          font-weight: 900;
          letter-spacing: -0.02em;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          cursor: pointer;
          box-shadow: ${on ? `0 4px 0 ${colors.dangerShadow}` : shadows.tactile};
          transform: translateY(0);
          transition: transform 90ms ease, box-shadow 90ms ease, background 200ms ease, color 200ms ease;
        }
        .${className}:active {
          transform: translateY(4px);
          box-shadow: 0 0 0 transparent;
        }
        .${className}:focus-visible {
          outline: none;
          box-shadow: ${shadows.tactile}, 0 0 0 3px var(--focus-ring);
        }
      `}</style>
      <button
        type="button"
        className={className}
        aria-label={label}
        aria-pressed={on}
        title={label}
        onClick={() => (on ? onToggle() : setAsking(true))}
      >
        +18
      </button>

      {asking && (
        <div
          className="anim-enter"
          role="dialog"
          aria-modal="true"
          aria-label="Tryb +18"
          style={{
            position: 'fixed',
            inset: 0,
            background: colors.overlay,
            zIndex: 110,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.lg,
            fontFamily: fonts.sans,
          }}
        >
          <Card elevation="strong" padded="lg" style={{ maxWidth: 360, textAlign: 'center' }}>
            <div style={{ fontSize: fontSizes.h2, fontWeight: fontWeights.black, color: colors.danger, marginBottom: spacing.sm }}>
              Tryb +18
            </div>
            <p
              style={{
                margin: 0,
                marginBottom: spacing.lg,
                fontSize: fontSizes.body,
                lineHeight: 1.4,
                fontWeight: fontWeights.semibold,
                color: colors.textSecondary,
              }}
            >
              Lektor zacznie przeklinać i jechać po graczach (np. „szmato”, „rusz dupę”). Tylko dla
              dorosłych i dla ekip, które się na to zgadzają.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                accentColor={colors.danger}
                shadowColor={colors.dangerShadow}
                onClick={() => {
                  setAsking(false)
                  onToggle()
                }}
              >
                Mam 18 lat, włącz
              </Button>
              <Button variant="ghost" size="md" fullWidth onClick={() => setAsking(false)}>
                Nie, dzięki
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
