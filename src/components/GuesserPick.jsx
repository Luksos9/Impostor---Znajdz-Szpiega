import { useState } from 'react'
import { colors, fonts, fontSizes, fontWeights, spacing } from '../styles/theme'
import Button from './ui/Button'
import { useFocusHeading } from '../utils/useFocusHeading'

// Private step before an impostor's word guess when several impostors are
// still hidden: the guesser taps their OWN name, so a wrong guess knocks out
// only them. Every player still in the game is listed, so the screen never
// reveals who the impostors are; a civilian who taps their name is just told
// to hand the phone back.
export default function GuesserPick({ players, impostorIds, accent, onPick, onBack }) {
  const [notImpostor, setNotImpostor] = useState(false)
  const headingRef = useFocusHeading()
  const cols = players.length <= 4 ? '1fr' : '1fr 1fr'

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
        Impostor
      </div>
      <h2
        ref={headingRef}
        tabIndex={-1}
        style={{
          fontSize: fontSizes.h2,
          fontWeight: fontWeights.black,
          margin: 0,
          marginBottom: spacing.sm,
          letterSpacing: '-0.02em',
        }}
      >
        Kto zgaduje?
      </h2>
      <p
        style={{
          fontSize: fontSizes.body,
          color: colors.textSecondary,
          margin: 0,
          marginBottom: spacing.xl,
          fontWeight: fontWeights.semibold,
        }}
      >
        Stuknij swoje imię. Pudło wyrzuca tylko Ciebie, reszta impostorów gra dalej.
      </p>

      {notImpostor ? (
        <div role="status" style={{ fontSize: fontSizes.h3, fontWeight: fontWeights.black, textAlign: 'center' }}>
          Tylko impostor może zgadywać. Oddaj telefon.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: cols, gap: spacing.md }}>
          {players.map((p) => (
            <Button
              key={p.id}
              variant="secondary"
              size="lg"
              accentColor={accent}
              fullWidth
              onClick={() => (impostorIds.includes(p.id) ? onPick(p.id) : setNotImpostor(true))}
              style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {p.name}
            </Button>
          ))}
        </div>
      )}

      <div style={{ flex: 1 }} />
      <Button variant="ghost" size="md" fullWidth onClick={onBack} style={{ marginTop: spacing.lg }}>
        Wróć
      </Button>
    </div>
  )
}
