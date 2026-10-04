// Polish grammar note: player names are typed by users, so we can't decline
// them. Every template therefore uses the name only in the nominative or as a
// call ("Ewa, ..."), and verbs in the present tense (no gendered past forms).
//
// Funny, varied narrator lines (Polish). Each helper picks a random template
// so repeated rounds don't sound like a broken record. Used for BOTH the voice
// and the on-screen headlines, so what you hear is what you read.

import { isSpicy, SPICY, SPICY_SHARE } from './spicy'

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
// Clean line, or (only with "Tryb +18" on) usually one from the spicy pool.
const pickLine = (spicy, clean) =>
  spicy?.length && isSpicy() && Math.random() < SPICY_SHARE ? pick(spicy) : pick(clean)
const fill = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '')

// Join names the Polish way: "Ala", "Ala i Bob", "Ala, Bob i Cy".
export function joinNames(names) {
  if (names.length <= 1) return names[0] || ''
  return `${names.slice(0, -1).join(', ')} i ${names[names.length - 1]}`
}

// "1 punkt", "2 punkty", "5 punktów", "22 punkty".
export function pointsWord(n) {
  const abs = Math.abs(n)
  if (abs === 1) return 'punkt'
  const last = abs % 10
  const lastTwo = abs % 100
  if (last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return 'punkty'
  return 'punktów'
}

export function passPhoneLine(name) {
  return fill(
    pickLine(SPICY.passPhone, [
      '{name}, teraz Ty. Reszta, nie patrzymy!',
      '{name}, ręce na telefon.',
      'Telefon wędruje do: {name}.',
      '{name}, telefon czeka na Ciebie. Podglądacze, odwróćcie wzrok.',
      'Podaj telefon dalej. Następny: {name}.',
      '{name}, bierz telefon. Reszta niech patrzy w sufit.',
      'Teraz {name}. Reszta, zamknijcie oczy. Albo chociaż udawajcie.',
      '{name}, Twoja kolej na telefon. Bez podglądania, proszę.',
      'Uwaga, uwaga! Telefon dla: {name}.',
      '{name}, odbierz telefon. To nie jest Twoja teściowa.',
      'Ręce na telefon, {name}!',
      '{name}, żwawo, żwawo! Telefon czeka.',
      'Nie ociągaj się, {name}. Telefon Twój.',
    ]),
    { name }
  )
}

export function speakerLine(name) {
  return fill(
    pickLine(SPICY.speaker, [
      '{name}, Twoja kolej. Jedno słowo.',
      'Głos ma {name}.',
      '{name}, powiedz coś mądrego. Albo cokolwiek.',
      'Teraz {name}. Bez paniki.',
      '{name}, na scenę!',
      '{name}, jedno słowo i ani słowa więcej.',
      'Mikrofon dla: {name}.',
      '{name}, mów! Ale ostrożnie.',
      'Teraz {name}. Reszta słucha. I podejrzewa.',
      '{name}, wszyscy czekają. Bez presji.',
      '{name}, tempo! Jedno słowo, nie epopeja.',
      'No dawaj, {name}. Nie ociągaj się.',
      '{name}, ręce przy sobie, język w ruch!',
    ]),
    { name }
  )
}

// A short aside after the speaker line, now and then, to keep the table laughing.
export function speakerQuip() {
  if (Math.random() > 0.35) return ''
  return pickLine(SPICY.quip, [
    'Impostor już się poci.',
    'Ktoś tu coś ukrywa.',
    'Uwaga na niepewne miny.',
    'Cywile, słuchajcie uważnie.',
    'Najlepsze kłamstwa brzmią najszczerzej.',
  ])
}

export function voteStartLine() {
  return pickLine(SPICY.voteStart, [
    'Czas na głosowanie. Kto tu kłamie?',
    'Głosujemy! Wskażcie winowajcę.',
    'Pora na sąd. Kogo podejrzewacie?',
    'Koniec gadania. Zaczynamy głosowanie!',
    'Wysoki sądzie, proszę o głosowanie.',
  ])
}

// Short, punchy inserts — the kind of thing a game-show host barks.
const SNAPPY = [
  'Ręce na telefon!',
  'Żwawo, żwawo!',
  'Raz, dwa!',
  'Nie ociągaj się!',
  'Szybko, bo ucieknie!',
  'No dawaj!',
  'Tempo, tempo!',
]
export function snappyLine() {
  return pick(SNAPPY)
}

// Spoken when someone dawdles. `n` is how many pokes have already happened,
// so the narrator gets progressively more impatient.
export function nudgeLine(n = 0) {
  const tiers = [
    ['Nie ociągaj się!', 'Halo, ktoś tu jest?', 'No dalej, wszyscy czekają.', 'Tempo, tempo!'],
    [
      'Czas leci, a impostor się cieszy.',
      'Obudźcie mnie, jak już zdecydujecie.',
      'Ja tu tylko mówię, ale ktoś mógłby się ruszyć.',
    ],
    ['Dobra, poczekam. Mam całą wieczność.', 'Ciekawe, kto pierwszy zaśnie.'],
  ]
  const tier = Math.min(n, tiers.length - 1)
  return pickLine(SPICY.nudge[Math.min(tier, SPICY.nudge.length - 1)], tiers[tier])
}

// After hiding the card.
export function hideLine() {
  return pickLine(SPICY.hide, ['Schowane. Podaj dalej, żwawo!', 'Mam to. Dawaj telefon dalej!', 'Zapamiętane. Nie ociągaj się!'])
}

// Start of every round: first round gets a proper welcome.
export function roundIntroLine(roundIndex, isLastRound) {
  if (roundIndex === 0) {
    return pickLine(SPICY.roundFirst, [
      'Zaczynamy grę! Powodzenia i niech wygra najlepszy kłamca.',
      'Zaczynamy! Dziś ktoś tu będzie kłamał.',
      'Gramy! Pamiętajcie: nikomu nie pokazujcie ekranu.',
    ])
  }
  if (isLastRound) {
    return pickLine(SPICY.roundLast, [
      'Ostatnia runda! Teraz albo nigdy.',
      'Finałowa runda. Wszystko może się jeszcze zmienić.',
    ])
  }
  return `Runda ${roundIndex + 1}. ` + pickLine(SPICY.roundMid, [
    'Kto tym razem będzie kłamał?',
    'Nowe słowo, nowy impostor.',
    'Ostrzcie języki.',
  ])
}

// A new describe turn (turn 2, 3...): the table goes around again.
export function turnLine(turn) {
  return `Tura ${turn}. ` + pickLine(SPICY.turn, [
    'Jedziemy jeszcze raz.',
    'Teraz trzeba się bardziej postarać.',
    'Impostor zaczyna się denerwować.',
  ])
}

export function decisionLine() {
  return pickLine(SPICY.decision, [
    'Co teraz? Głosujemy, jedziemy dalej, czy ktoś chce zgadywać?',
    'Pora na decyzję. Głosowanie, kolejna tura albo strzał impostora.',
    'Ustalcie to między sobą. Głosujemy, czy gramy dalej?',
  ])
}

export function cardReminderLine() {
  return pickLine(SPICY.cardReminder, [
    'Tylko Ty patrzysz na ekran. Zapamiętaj i schowaj.',
    'Spójrz i zapamiętaj. Nikomu ani słowa.',
    'To tylko dla Ciebie. Miej kamienną twarz.',
  ])
}

export function voteEntryLine() {
  return pickLine(SPICY.voteEntry, [
    'Wybierz po cichu. Nikt nie patrzy.',
    'Kogo podejrzewasz? Stuknij imię.',
    'Głosuj z sercem. I z podejrzliwością.',
  ])
}

export function guessConfirmLine() {
  return pickLine(SPICY.guessConfirm, [
    'Ktoś chce zgadywać? To kończy rundę. Na pewno?',
    'Strzał impostora kończy rundę. Jesteście pewni?',
    'Uwaga! Zgadywanie kończy rundę. Na pewno?',
  ])
}

export function guessEntryLine() {
  return pickLine(SPICY.guessEntry, [
    'Impostor zgaduje słowo. Reszta, ani pary z ust.',
    'Teraz jedna próba. Wpisz słowo i trzymaj kciuki.',
    'Strzał impostora! Cisza na sali.',
  ])
}

// Who gained the most this round, e.g. "Najwięcej punktów zdobywa Ala: plus 2."
export function pointsLine(deltas, players) {
  const best = Math.max(0, ...players.map((p) => deltas[p.id] || 0))
  if (best <= 0) return 'W tej rundzie nikt nie zdobywa punktów.'
  const names = players.filter((p) => (deltas[p.id] || 0) === best).map((p) => p.name)
  const verb = names.length > 1 ? 'zdobywają' : 'zdobywa'
  return `Najwięcej punktów ${verb}: ${joinNames(names)}, po plus ${best}.`
}

export function gameOverLine(winners, topScore, runnersUp = [], runnerScore = 0) {
  const names = joinNames(winners)
  const score = `${topScore} ${pointsWord(topScore)}`
  const second =
    runnersUp.length > 0
      ? ` Drugie miejsce: ${joinNames(runnersUp)}, ${runnerScore} ${pointsWord(runnerScore)}.`
      : ''
  if (winners.length > 1) {
    return fill(
      pickLine(SPICY.gameOverTie, [
        'Mamy remis! {names}, po {score}. Dogrywka sama się nie zagra.',
        'Remis! {names} dzielą zwycięstwo, po {score}.',
      ]),
      { names, score }
    ) + second
  }
  return fill(
    pickLine(SPICY.gameOverOne, [
      'Koniec gry! Wygrywa {names} z wynikiem {score}. Reszta może się pocieszać.',
      'Wygrywa {names}! {score}. Gratulacje, geniuszu zbrodni.',
      'Mamy zwycięzcę: {names}, {score}!',
      'Bijcie brawo! {names} wygrywa, {score}.',
    ]),
    { names, score }
  ) + second
}

// Round outcome copy. `kind` is one of:
//   caught        – the table found the impostor(s)
//   escaped       – the table voted wrong / split
//   guessRight    – impostor guessed the secret word
//   guessWrong    – impostor tried and failed
export function roundHeadline(
  kind,
  { impostorNames = [], word = '', plural = false, role = 'impostor', caughtNames = [], escapedNames = [] } = {}
) {
  const names = joinNames(impostorNames)
  const vars = {
    names,
    word,
    win: plural ? 'Impostorzy wygrywają.' : 'Impostor wygrywa.',
    caught: joinNames(caughtNames),
    escaped: joinNames(escapedNames),
    escapes: escapedNames.length > 1 ? 'wychodzą' : 'wychodzi',
    falls: caughtNames.length > 1 ? 'wpadają' : 'wpada',
  }
  const T = {
    caught: plural
      ? [
          'Mamy was, {names}! Cywile wygrywają.',
          '{names} wpadają! Cywile zacierają ręce.',
          'Zdemaskowano: {names}. Cywile wygrywają!',
        ]
      : [
          'Mamy Cię, {names}! Cywile wygrywają.',
          '{names} wpada! Cywile zacierają ręce.',
          'Zdemaskowano: {names}. Cywile wygrywają!',
          'Dobra robota, cywile! {names} nie ma już gdzie uciec.',
        ],
    escaped: plural
      ? [
          '{names} wychodzą z tego cało! Impostorzy wygrywają.',
          'Cywile pudłują, a {names} świętują.',
          'Pudło! {names} śmieją się ostatni.',
        ]
      : [
          '{names} wychodzi z tego cało! Impostor wygrywa.',
          'Pudło! Cywile nie wiedzą, kto kłamie, a {names} się uśmiecha.',
          'Cywile głosują, a {names} ucieka bez szwanku.',
        ],
    // Several impostors: some caught one by one, the rest got away.
    partial: [
      '{caught} {falls}, ale {escaped} {escapes} z tego cało!',
      'Pół na pół: {caught} w areszcie, a {escaped} {escapes} na wolność.',
      'Cywile łapią: {caught}. Ale {escaped} {escapes} bez szwanku!',
    ],
    guessRight: [
      'Impostor trafia w słowo: {word}! {win}',
      'Ale jazda! Impostor zgaduje: {word}. Dobry nos.',
      '{word}! Impostor wyczuwa temat jak pies tropiący.',
    ],
    guessWrong: [
      'Impostor strzela i pudłuje. Słowo to: {word}. Cywile wygrywają.',
      'Nie tym razem, impostorze. Szukane słowo: {word}.',
      'Pudło! Słowo brzmi: {word}. Impostor chyba zgaduje z sufitu.',
    ],
  }
  const H = SPICY.headline
  const spicyFor = {
    caught: plural ? H.caughtMany : H.caughtOne,
    escaped: plural ? H.escapedMany : H.escapedOne,
    partial: H.partial,
    guessRight: H.guessRight,
    guessWrong: H.guessWrong,
  }
  const line = fill(pickLine(spicyFor[kind] || spicyFor.escaped, T[kind] || T.escaped), vars)
  if (role !== 'kameleon') return line
  // Kameleon mode: same jokes, the odd one out is called "kameleon".
  return line
    .replace(/impostorze/g, 'kameleonie')
    .replace(/Impostor/g, 'Kameleon')
    .replace(/impostor/g, 'kameleon')
}

// After a vote exposes one impostor while others are still hidden.
// `remaining` is how many are still hidden (1-3: at most 4 impostors).
// `name` may be a list when a quick vote catches several at once.
export function catchLine(name, remaining) {
  const left =
    remaining === 1
      ? 'Został jeszcze jeden.'
      : `Zostało jeszcze ${remaining === 2 ? 'dwóch' : 'trzech'}.`
  if (Array.isArray(name) && name.length > 1) {
    return fill(
      pickLine(['Mamy te gnidy! {names} to impostorzy. Duet żenady, kurwa. {left}'], [
        'Podwójne trafienie! {names} to impostorzy. {left}',
        'Za jednym zamachem: {names}! {left}',
      ]),
      { names: joinNames(name), left }
    )
  }
  if (Array.isArray(name)) name = name[0]
  return fill(
    pickLine(SPICY.catch, [
      'Mamy jednego! {name} to impostor. {left}',
      'Trafienie! {name} odpada. {left} Gramy dalej czy głosujemy znowu?',
      'Zdemaskowano: {name}! {left} Nie spoczywajcie na laurach.',
    ]),
    { name, left }
  )
}

// On an impostor's card when there is more than one: who the partners are.
export function partnersLine(names) {
  if (names.length === 0) return ''
  return names.length === 1
    ? `Drugi impostor: ${names[0]}`
    : `Pozostali impostorzy: ${joinNames(names)}`
}
