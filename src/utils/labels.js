// Single source of truth for all Polish strings in the app.
// Every component imports from here so copy tweaks happen in one place.
// Use t(template, vars) for strings with placeholders like "{name}" or "{n}".

export const L = {
  app: {
    title: 'Impostor',
    tagline: 'Gra imprezowa na jeden telefon',
  },

  menu: {
    chooseMode: 'Wybierz tryb',
    resume: 'Wróć do gry',
  },

  quickSetup: {
    title: 'Kto gra?',
    playerCount: 'Liczba graczy',
    roundCount: 'Liczba rund',
    start: 'Graj',
    back: 'Wstecz',
    minPlayers: 'Minimum {n} graczy dla tego trybu',
  },

  privacy: {
    pass: 'Podaj telefon graczowi',
    flipAndPass: 'Obróć ekranem do dołu i podaj',
    iAmReady: 'Jestem gotowy/a',
  },

  card: {
    youAreImpostor: 'Jesteś impostorem',
    youAreImpostorHint: 'Udawaj. Wmieszaj się.',
    youAreChameleon: 'Jesteś kameleonem',
    youAreChameleonHint: 'Nie wiesz, które słowo jest tajne.',
    yourWord: 'Twoje słowo',
    yourCommonQuestion: 'Twoje pytanie',
    yourImpostorQuestion: 'Twoje pytanie',
    yourSecretWord: 'Tajne słowo',
    category: 'Kategoria',
    rememberIt: 'Już pamiętam',
    hiddenConfirm: 'Schowane. Stuknij, gdy oddasz telefon.',
    nextPlayer: 'Dalej',
  },

  classic: {
    nowSpeaking: 'Teraz mówi',
    nextPlayer: 'Następny',
    turn: 'Tura {n} / {total}',
    callVote: 'Zwołaj głosowanie',
    callVoteHint: 'Typuj, kto jest impostorem',
    nextTurn: 'Następna tura',
    nextTurnHint: 'Jeszcze jedna runda opisów',
    iAmImpostor: 'Jestem impostorem, zgaduję słowo',
    iAmImpostorHint: 'Tylko dla impostora',
    guessPlaceholder: 'Wpisz słowo…',
    submitGuess: 'Zgaduję',
    describeHint: 'Powiedz JEDNO słowo, które opisuje tajne słowo',
    describeIntroTitle: 'Czas rozmawiać',
    describeIntroDesc: 'Każdy po kolei powie jedno słowo, które opisuje tajne słowo. Impostor nie zna słowa i musi się wmieszać. Zaczyna: {name}',
    describeIntroCta: 'Zaczynamy',
    whatNext: 'Co teraz?',
    whatNextHint: 'Ustalcie razem i wybierzcie',
  },

  phaseIntro: {
    revealDoneTitle: 'Każdy zobaczył swoje',
    writeIntroTitle: 'Czas na odpowiedzi',
    writeIntroDesc: 'Każdy po kolei napisze krótką odpowiedź na swoje pytanie. Podawajcie telefon. Odpowiedzi ujawnimy na końcu.',
    writeIntroCta: 'Lecimy',
    kameleonDescribeDesc: 'Każdy po kolei powie jedno słowo, które pasuje do tajnego słowa. Kameleon widzi tylko siatkę i musi zgadnąć. Zaczyna: {name}',
    gridSeenTitle: 'Wszyscy widzą siatkę',
    gridSeenDesc: 'Za chwilę każdy z was dostanie telefon i zobaczy prywatnie tajne słowo. Jeden z was to kameleon i nie zobaczy tajnego słowa.',
    gridSeenCta: 'Zaczynamy rozdawać karty',
  },

  pairsQuestion: {
    writeAnswer: 'Napisz odpowiedź',
    answerPlaceholder: 'Twoja odpowiedź…',
    commonQuestionLabel: 'Pytanie wszystkich',
    allAnswers: 'Odpowiedzi',
    revealGridHint: 'Porównajcie odpowiedzi. Czyja jest najdziwniejsza?',
  },

  kameleon: {
    topic: 'Temat',
    grid: 'Siatka słów',
    secretWord: 'Tajne słowo',
    tapToGuess: 'Stuknij słowo z siatki',
    iAmChameleon: 'Jestem kameleonem, zgaduję słowo',
  },

  vote: {
    title: 'Głosuj',
    instruction: 'Stuknij, kogo podejrzewasz',
  },

  result: {
    impostorWas: 'Impostorem był(a)',
    chameleonWas: 'Kameleonem był(a)',
    impostorEscaped: 'Impostor uciekł',
    impostorCaught: 'Impostor złapany',
    chameleonEscaped: 'Kameleon uciekł',
    chameleonCaught: 'Kameleon złapany',
    wordGuessCorrect: 'Trafił słowo',
    wordGuessWrong: 'Nie trafił słowa',
    pointsThisRound: 'Punkty w tej rundzie',
    next: 'Następna runda',
    finalResults: 'Wyniki',
  },

  gameOver: {
    title: 'Koniec gry',
    winner: 'Zwycięzca',
    winners: 'Zwycięzcy',
    playAgain: 'Gramy jeszcze',
    backToMenu: 'Menu',
  },

  scoreboard: {
    round: 'Runda {n} / {total}',
    quit: 'Wyjdź',
    quitConfirm: 'Przerwać tę grę? Postęp przepadnie.',
    quitYes: 'Tak, przerwij',
    quitNo: 'Wróć do gry',
  },

  buttons: {
    back: 'Wstecz',
    cancel: 'Anuluj',
    confirm: 'Zatwierdź',
  },
}

// Simple template interpolation for strings with {name} or {n} placeholders.
// Example: t(L.quickSetup.minPlayers, { n: 4 }) → "Minimum 4 graczy dla tego trybu"
export function t(template, vars = {}) {
  if (!template) return ''
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match
  )
}
