# Impostor

Polska gra imprezowa typu pass-and-play na jeden telefon. 3 tryby, jeden pakiet treści (Domówka), wszystko po polsku.

## Tryby

1. **Klasyczny impostor** — gracze dostają tajne słowo, opisują je jednym słowem na głos. Impostor nie zna słowa i próbuje się wmieszać albo zgadnąć.
2. **Kto ma inne pytanie?** — wszyscy piszą krótką odpowiedź. Impostor ma inne pytanie niż reszta.
3. **Kameleon** — publiczna siatka 16 słów z wybranym tematem. Jedno słowo jest tajne. Kameleon nie wie które.

Wszystkie tryby działają dla 3–8 graczy (Klasyczny wymaga minimum 4).

## Jak zacząć

```bash
npm install
npm run dev
```

Otwórz `http://localhost:5173` (lub ten, który pokaże Vite).

Build produkcyjny:

```bash
npm run build
npm run preview
```

## Zasada 3 stuknięć

1. Otwórz aplikację
2. Wybierz tryb
3. Stuknij "Graj"

Gra zaczyna się natychmiast. Nie ma rejestracji, nie ma kont, nie ma reklam.

## Jak grać

- **Podawaj telefon** graczowi, którego imię widzisz na ekranie. Obróć ekranem do dołu zanim oddasz, żeby nikt nie podejrzał.
- Każdy sekret chowa się na **dwa stuknięcia** — najpierw "Już pamiętam", potem "Schowane, stuknij gdy oddasz telefon". To zabezpieczenie przed przypadkowym podejrzeniem.
- **Głosowanie** też jest prywatne — każdy gracz dostaje telefon po kolei i stawia swój głos.
- Gra jest w pełni offline po pierwszym załadowaniu. Żadna gra nie wymaga internetu.

## Struktura kodu

```
src/
  App.jsx                     # state machine (menu → setup → playing → gameover)
  styles/theme.js             # tokeny (kolory, fonty, odstępy)
  utils/                      # storage, shuffle, players, scoring, content, sounds, labels
  data/
    modes.js                  # rejestr trybów
    packs/domowka.js          # treść (60 słów, 30 pytań, 15 siatek)
  components/
    Menu, QuickSetup, PrivacyHandoff, CardReveal, PrivateInput,
    VoteGrid, RoundResult, GameOver, ScoreboardHeader,
    modes/ModeClassic, ModePairsQuestion, ModeKameleon
```

## Nieobecne w v1

Nie ma w pierwszej wersji i nie planuje się na razu: online multiplayer, konta, reklamy, kupony, płatności, historia gier, podwójny impostor, English, animacje poza podstawowymi transitions, tryb jasny.

## Licencja

Prywatny projekt. Brak licencji publicznej na razie.
