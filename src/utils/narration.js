// Polish grammar note: player names are typed by users, so we can't decline
// them. Every template therefore uses the name only in the nominative or as a
// call ("Ewa, ..."), and verbs in the present tense (no gendered past forms).
//
// Funny, varied narrator lines (Polish). Each helper picks a random template
// so repeated rounds don't sound like a broken record. Used for BOTH the voice
// and the on-screen headlines, so what you hear is what you read.

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
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
    pick([
      '{name}, teraz Ty. Reszta, nie patrzymy!',
      '{name}, ręce na telefon.',
      'Telefon wędruje do: {name}.',
      '{name}, telefon czeka na Ciebie. Podglądacze, odwróćcie wzrok.',
      'Podaj telefon dalej. Następny: {name}.',
    ]),
    { name }
  )
}

export function speakerLine(name) {
  return fill(
    pick([
      '{name}, Twoja kolej. Jedno słowo.',
      'Głos ma {name}.',
      '{name}, powiedz coś mądrego. Albo cokolwiek.',
      'Teraz {name}. Bez paniki.',
      '{name}, na scenę!',
    ]),
    { name }
  )
}

export function voteStartLine() {
  return pick([
    'Czas na głosowanie. Kto tu kłamie?',
    'Głosujemy! Wskażcie winowajcę.',
    'Pora na sąd. Kogo podejrzewacie?',
  ])
}

export function gameOverLine(winners, topScore) {
  const names = joinNames(winners)
  const score = `${topScore} ${pointsWord(topScore)}`
  if (winners.length > 1) {
    return fill(
      pick([
        'Mamy remis! {names}, po {score}. Dogrywka sama się nie zagra.',
        'Remis! {names} dzielą zwycięstwo, po {score}.',
      ]),
      { names, score }
    )
  }
  return fill(
    pick([
      'Koniec gry! Wygrywa {names} z wynikiem {score}. Reszta może się pocieszać.',
      'Wygrywa {names}! {score}. Gratulacje, geniuszu zbrodni.',
      'Mamy zwycięzcę: {names}, {score}!',
    ]),
    { names, score }
  )
}

// Round outcome copy. `kind` is one of:
//   caught        – the table found the impostor(s)
//   escaped       – the table voted wrong / split
//   guessRight    – impostor guessed the secret word
//   guessWrong    – impostor tried and failed
export function roundHeadline(kind, { impostorNames = [], word = '', plural = false } = {}) {
  const names = joinNames(impostorNames)
  const vars = { names, word }
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
    guessRight: [
      '{names} trafia w słowo: {word}! Impostor wygrywa.',
      'Ale jazda! {names} zgaduje: {word}. Dobry nos.',
      '{word}! {names} wyczuwa temat jak pies tropiący.',
    ],
    guessWrong: [
      '{names} strzela i pudłuje. Słowo to: {word}. Cywile wygrywają.',
      'Nie tym razem, {names}. Szukane słowo: {word}.',
      'Pudło! Słowo brzmi: {word}. Impostor chyba zgaduje z sufitu.',
    ],
  }
  return fill(pick(T[kind] || T.escaped), vars)
}
