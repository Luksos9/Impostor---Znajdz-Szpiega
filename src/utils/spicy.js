// "Tryb +18": the narrator swears and roasts the players. OFF by default and
// only switched on after an explicit adults-only confirmation in the menu.
//
// Same grammar rule as narration.js: player names are typed by users, so they
// appear only as a call ("{name}, ...") or in the nominative, and verbs stay in
// the present tense. Banter only: no slurs about origin, religion, sexuality or
// disability.

const SETTINGS_KEY = 'imposter.settings'

export function isSpicy() {
  try {
    const raw = globalThis.localStorage?.getItem(SETTINGS_KEY)
    return !!(raw && JSON.parse(raw).spicyMode === true)
  } catch {
    return false
  }
}

// When spicy mode is on, most lines come from these pools; the rest stay clean
// so the swearing keeps its punch instead of turning into noise.
export const SPICY_SHARE = 0.75

export const SPICY = {
  passPhone: [
    '{name}, łap telefon, szmato!',
    '{name}, rusz dupę, telefon czeka!',
    'Kurwa, {name}, Twoja kolej. Reszta, oczy w podłogę!',
    '{name}, bierz to cholerstwo i nie pierdol.',
    'Telefon dla: {name}. Reszta nie podgląda, zboczeńcy.',
    '{name}, dawaj, szmato, nie mamy całej nocy!',
    '{name}, łapy na telefon i jazda, do cholery!',
  ],
  speaker: [
    '{name}, gadaj, kurwa, jedno słowo!',
    '{name}, tylko nie pierdol od rzeczy.',
    'Głos ma {name}. Oby tego nie spierdolić.',
    '{name}, mów, szmato, wszyscy patrzą!',
    '{name}, jedno słowo. Jedno, a nie elaborat, do chuja pana.',
    'Teraz {name}. Kłam jak z nut, gnoju.',
    '{name}, dawaj i nie sraj w gacie.',
  ],
  quip: [
    'Ktoś tu łże jak pies.',
    'Impostor już sra w gacie.',
    'Czuję tu zapach ściemy.',
    'Ale kit wciska, kurwa.',
    'Ktoś tu pierdoli jak potłuczony.',
  ],
  voteStart: [
    'Dość pierdolenia. Głosujemy!',
    'Czas wskazać tę gnidę!',
    'Kto tu łże jak pies? Głosujemy, kurwa!',
  ],
  nudge: [
    ['Rusz dupę!', 'Halo, kurwa, ktoś tu żyje?', 'No dawaj, szmato, czekamy!'],
    ['Czas leci, a impostor się z was nabija.', 'Szybciej, do cholery, bo zasnę.', 'Ja pierdolę, ile można?'],
    ['Dobra, pierdolę to, idę na fajkę.', 'Serio? Szybciej, ślimaki jebane.'],
  ],
  hide: [
    'Schowane. Dawaj dalej, szybko, kurwa!',
    'Zapamiętane? To spierdalaj z telefonem dalej.',
    'Gotowe. Telefon dalej, nie ociągaj się, szmato!',
  ],
  roundFirst: [
    'Zaczynamy, kurwa! Niech wygra największy łgarz.',
    'Jedziemy! Ktoś tu dziś będzie kłamał jak pies.',
  ],
  roundLast: ['Ostatnia runda, kurwa! Teraz albo nigdy.', 'Finał, szmaty! Wszystko jeszcze może się spierdolić.'],
  roundMid: ['Kto tym razem będzie łgał jak pies?', 'Nowe słowo, nowa gnida.', 'Ostrzcie języki, łachudry.'],
  turn: ['Jeszcze raz, kurwa.', 'Teraz bez pierdolenia.', 'Impostor już się poci jak mysz.'],
  decision: [
    'No i co, kurwa? Głosujemy, gramy dalej, czy ktoś strzela?',
    'Decyzja, szmaty! Głosowanie, kolejna tura czy strzał?',
  ],
  cardReminder: [
    'Zapamiętaj i nie pierdol nikomu.',
    'Patrz i mordę w kubeł.',
    'Tylko dla Ciebie. Kamienna twarz, kurwa.',
  ],
  voteEntry: ['Wskaż tę szmatę po cichu.', 'Kto tu łże? Stuknij, kurwa, imię.', 'Głosuj z sercem. I z wkurwem.'],
  guessConfirm: [
    'Ktoś chce strzelać? To kończy rundę, kurwa. Na pewno?',
    'Strzał kończy rundę. Nie spierdolcie tego.',
  ],
  guessEntry: ['Impostor strzela. Reszta, mordy w kubeł!', 'Jedna próba. Nie spierdol tego.'],
  catch: [
    'Mamy gnidę! {name} to impostor. {left}',
    'Jest, kurwa! {name} odpada. {left}',
    'Zdemaskowano tę szmatę: {name}! {left}',
  ],
  gameOverOne: [
    'Koniec gry, kurwa! Wygrywa {names}, {score}. Reszta to frajerzy.',
    'Wygrywa {names}, {score}. Reszta może się pocałować w dupę.',
  ],
  gameOverTie: ['Remis, kurwa! {names}, po {score}.', 'Remis, szmaty! {names} dzielą zwycięstwo, po {score}.'],
  headline: {
    caughtOne: [
      'Mamy Cię, szmato! {names} wpada. Cywile wygrywają.',
      'Koniec pierdolenia, {names}. Cywile wygrywają!',
    ],
    caughtMany: [
      'Mamy was, szmaty! {names} wpadają. Cywile wygrywają.',
      'Koniec pierdolenia, {names}. Cywile wygrywają!',
    ],
    escapedOne: [
      '{names} wychodzi z tego cało. Ale z was frajerzy! Impostor wygrywa.',
      'Kurwa, pudło! {names} robi was w chuja. Impostor wygrywa.',
    ],
    escapedMany: [
      '{names} robią was w chuja! Impostorzy wygrywają.',
      'Ale frajerstwo! {names} wychodzą z tego cało.',
    ],
    partial: ['{caught} {falls}, ale {escaped} {escapes} cało. Pół na pół, kurwa.'],
    guessRight: ['Kurwa, trafione: {word}! {win}', 'No ja pierdolę, impostor zgaduje: {word}. {win}'],
    guessWrong: [
      'Pudło, frajerze! Słowo to: {word}. Cywile wygrywają.',
      'Gówno, nie trafione. Słowo brzmi: {word}. Cywile wygrywają.',
    ],
  },
}
