import { colors, fonts, fontSizes, fontWeights, spacing } from '../styles/theme'
import Button from './ui/Button'
import Card from './ui/Card'
import { useFocusHeading } from '../utils/useFocusHeading'

const SECTIONS = [
  {
    title: 'Jak to działa',
    body: 'Gracie na jednym telefonie. Podawajcie go dalej z ekranem do dołu i nie podglądajcie. W każdej rundzie jest sekret, który zna większość graczy (cywile), oraz impostor, który go nie zna i musi się wmieszać.',
  },
  {
    title: 'Klasyczny impostor',
    body: 'Cywile dostają to samo słowo, impostor nie dostaje żadnego. Po kolei mówicie JEDNO słowo opisujące hasło: nie za oczywiste, żeby impostor go nie zgadł, i nie za dziwne, żeby cywile Wam uwierzyli. Potem głosujecie albo gracie kolejną turę (maksymalnie trzy). Impostor może w każdej chwili spróbować zgadnąć słowo — to kończy rundę. Gdy impostorów jest kilku, znają się nawzajem (widzą to na swojej karcie), a cywile łapią ich po jednym: po każdym złapanym możecie grać dalej albo głosować na następnego.',
  },
  {
    title: 'Kameleon',
    body: 'Wszyscy widzą siatkę 16 słów. Cywile znają jedno tajne słowo z siatki, kameleon nie. Mówicie po jednym słowie pasującym do tajnego. Kameleon może spróbować wskazać tajne słowo w siatce.',
  },
  {
    title: 'Kto ma inne pytanie?',
    body: 'Wszyscy dostają to samo pytanie, impostor — podobne, ale inne. Każdy pisze krótką odpowiedź i na koniec odpowiedzi widzą wszyscy. Głosujecie, kto odpowiadał na inne pytanie.',
  },
  {
    title: 'Głosowanie i punkty',
    body: 'Głosowanie wskazuje jedną osobę: tę, którą wybierze więcej niż połowa cywili. Jeśli to impostor, odpada, a każdy cywil, który go wskazał, dostaje +1. Jeśli głosy się rozejdą albo wskażecie cywila, runda się kończy i każdy impostor, który się ukrył, dostaje +2. Impostor zgadnie słowo: +3 dla impostorów. Nie trafi: +1 dla każdego cywila. Po ostatniej rundzie wygrywa ten, kto ma najwięcej punktów.',
  },
]

// Rules for first-time players (shown once, then from the "?" button on the menu).
export default function HowToPlay({ onClose }) {
  const headingRef = useFocusHeading()
  return (
    <div
      className="anim-enter"
      role="dialog"
      aria-modal="true"
      aria-labelledby="howto-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: colors.overlay,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        fontFamily: fonts.sans,
      }}
    >
      <Card elevation="strong" padded="lg" style={{ maxWidth: 440, maxHeight: '90dvh', display: 'flex', flexDirection: 'column' }}>
        <h2
          id="howto-title"
          ref={headingRef}
          tabIndex={-1}
          style={{
            margin: 0,
            marginBottom: spacing.md,
            fontSize: fontSizes.h2,
            fontWeight: fontWeights.black,
            letterSpacing: '-0.02em',
            color: colors.textPrimary,
          }}
        >
          Jak grać?
        </h2>
        <div style={{ overflowY: 'auto', minHeight: 0, flex: 1, marginBottom: spacing.md }}>
          {SECTIONS.map((s) => (
            <section key={s.title} style={{ marginBottom: spacing.md }}>
              <h3
                style={{
                  margin: 0,
                  marginBottom: spacing.xs,
                  fontSize: fontSizes.bodyLg,
                  fontWeight: fontWeights.extraBold,
                  color: colors.textPrimary,
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: fontSizes.body,
                  lineHeight: 1.45,
                  fontWeight: fontWeights.semibold,
                  color: colors.textSecondary,
                }}
              >
                {s.body}
              </p>
            </section>
          ))}
        </div>
        <Button variant="primary" size="lg" fullWidth accentColor={colors.textPrimary} textColor={colors.bg} onClick={onClose}>
          Rozumiem
        </Button>
      </Card>
    </div>
  )
}
