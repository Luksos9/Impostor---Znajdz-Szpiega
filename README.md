# Impostor — Gra imprezowa

Polska gra imprezowa typu pass-and-play na jeden telefon. 3 tryby, jeden pakiet treści (Domówka), wszystko po polsku. Działa offline jako PWA — można zainstalować na telefonie i grać bez internetu.

**Live:** [impostor-znajdz-szpiega.vercel.app](https://impostor-znajdz-szpiega.vercel.app)

## Tryby

1. **Klasyczny impostor** — gracze dostają tajne słowo i opisują je jednym słowem na głos. Impostor nie zna słowa i próbuje się wmieszać albo zgadnąć.
2. **Kto ma inne pytanie?** — wszyscy piszą krótką odpowiedź. Impostor ma inne pytanie niż reszta. Po ujawnieniu odpowiedzi reszta szuka tej, która nie pasuje.
3. **Kameleon** — publiczna siatka 16 słów na wybrany temat. Jedno słowo jest tajne. Kameleon nie wie które i musi zgadywać po opisach reszty.

Wszystkie tryby działają dla 3–8 graczy.

## Zasada 3 stuknięć

1. Otwórz aplikację
2. Wybierz tryb (Klasyczny / Pytania / Kameleon)
3. Stuknij **Graj**

Gra zaczyna się natychmiast. Bez rejestracji, bez kont, bez reklam, bez płatności.

## Instalacja na telefonie (PWA)

### iPhone (Safari)

1. Otwórz [impostor-znajdz-szpiega.vercel.app](https://impostor-znajdz-szpiega.vercel.app) w **Safari** (nie Chrome — iOS pozwala instalować PWA tylko z Safari)
2. Stuknij ikonę **Udostępnij** (kwadrat ze strzałką w górę)
3. Przewiń w dół i wybierz **Dodaj do ekranu początkowego**
4. Stuknij **Dodaj** w prawym górnym rogu

Aplikacja pojawi się na ekranie głównym jako pełnoekranowa appka — bez paska adresu, bez przycisków przeglądarki, działa offline po pierwszym otwarciu.

### Android (Chrome)

1. Otwórz [impostor-znajdz-szpiega.vercel.app](https://impostor-znajdz-szpiega.vercel.app) w Chrome
2. Stuknij menu (3 kropki, prawy górny róg)
3. Wybierz **Zainstaluj aplikację** (lub **Dodaj do ekranu głównego**)
4. Potwierdź **Zainstaluj**

Po instalacji aplikacja działa jak natywna — pełnoekranowa, offline, ikona na ekranie głównym.

## Jak grać

- **Podawaj telefon** graczowi, którego imię widzisz na ekranie. Obróć ekranem do dołu zanim oddasz, żeby nikt nie podejrzał z boku.
- Każdy sekret chowa się na **dwa stuknięcia** — najpierw "Już pamiętam", potem "Schowane, oddaj telefon". Zabezpieczenie przed przypadkowym podejrzeniem.
- **Głosowanie** też jest prywatne — każdy gracz dostaje telefon po kolei i stawia swój głos.
- Gra jest w pełni offline po pierwszym załadowaniu.

## Tech stack

- **React 19** + **Vite 7** + JSX (no TypeScript)
- **PWA** via [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/) 1.2.0 + Workbox
- **Nunito** font z Google Fonts (preconnect)
- **CSS-in-JS** przez inline style objects (no CSS modules, no styled-components)
- **Tokeny designu** w `src/styles/theme.js` (kolory, fonty, odstępy, cienie)
- **Theme toggle** light/dark przez `[data-theme]` na `<html>` i CSS variables
- Brak zewnętrznych zależności run-time poza Google Fonts
- Brak API, brak backendu, brak bazy danych

## Lokalna instalacja

```bash
git clone https://github.com/Luksos9/Impostor---Znajdz-Szpiega.git
cd Impostor---Znajdz-Szpiega
npm install
npm run dev
```

Otwórz `http://localhost:5173`.

### Build produkcyjny

```bash
npm run build      # buduje do dist/
npm run preview    # serwuje dist/ na http://localhost:4173
```

### Generowanie ikon PWA

Po zmianie ikony bazowej (`public/images/mode-classic.png`) odśwież zestaw ikon:

```bash
npx @vite-pwa/assets-generator --preset minimal-2023 public/images/mode-classic.png
```

Potem przenieś `pwa-*.png`, `apple-touch-icon-180x180.png`, `favicon.ico`, `maskable-icon-512x512.png` z `public/images/` do `public/` (root).

## Deploy na Vercel

Repo jest podpięte do Vercela przez GitHub. Każdy push do `main` automatycznie deployuje preview + production.

Konfiguracja Vercela: nic nie trzeba ustawiać. Vercel sam wykrywa Vite, używa `npm run build` i serwuje `dist/`. Bez env vars, bez build commands, bez output directory override.

## Struktura kodu

```
src/
  main.jsx                    # entry, registers service worker
  App.jsx                     # state machine: menu → setup → playing → gameover
  styles/
    theme.js                  # tokeny: colors, fonts, spacing, radii, shadows
  utils/
    storage.js                # localStorage wrapper for settings
    shuffle.js                # Fisher-Yates
    players.js                # autoGeneratePlayers, pickImpostor
    scoring.js                # pure delta funcs + normalizePolishForCompare
    content.js                # pickContent with anti-repeat
    sounds.js                 # useSounds hook (gated by settings)
    labels.js                 # all Polish strings
  data/
    modes.js                  # MODE_REGISTRY (3 modes)
    packs/
      index.js                # ALL_PACKS aggregator
      domowka.js              # 60 słów + 30 par pytań + 15 siatek Kameleona
  components/
    Menu.jsx                  # tryby + theme toggle
    QuickSetup.jsx            # liczba graczy + edycja imion + liczba rund
    ScoreboardHeader.jsx      # ProgressDots + chipy + Wyjdź
    PrivacyHandoff.jsx        # "Podaj telefon graczowi X"
    CardReveal.jsx            # tajne słowo / role z dwoma stuknięciami
    PhaseIntro.jsx            # bridge screen między fazami
    PrivateInput.jsx          # textarea pass-and-play
    VoteGrid.jsx              # głosowanie
    RoundResult.jsx           # wynik rundy z pop animacjami
    GameOver.jsx              # zwycięzca z celebracją
    ui/
      Button.jsx              # Duolingo tactile press
      Card.jsx                # chunky surface
      ProgressDots.jsx        # round progress
      ThemeToggle.jsx         # light/dark switch
    modes/
      ModeClassic.jsx
      ModePairsQuestion.jsx
      ModeKameleon.jsx
public/
  favicon.ico
  apple-touch-icon-180x180.png
  pwa-64x64.png
  pwa-192x192.png
  pwa-512x512.png
  maskable-icon-512x512.png
  images/
    mode-classic.png
    mode-pairs-question.png
    mode-kameleon.png
```

## Czego nie ma w v1

Świadomie pominięte i nie planowane na razie: online multiplayer, konta, reklamy, kupony, płatności, historia gier, podwójny impostor, English, animacje poza podstawowymi transitions, custom packi treści tworzone przez użytkownika.

## Licencja

Prywatny projekt. Brak licencji publicznej.
