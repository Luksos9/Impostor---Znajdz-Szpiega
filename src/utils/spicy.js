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
    '{name}, łap telefon. Ostrożnie, cięższy niż Twoja ostatnia myśl.',
    '{name}, Twoja kolej, łamago. Reszta oczy w podłogę, zboczeńcy!',
    '{name}, bierz telefon i nie pierdol. Wiem, że to dla Ciebie wyzwanie.',
    '{name}, łap, szmato! Tylko nie upuść, jak swojej godności.',
    'Telefon dla: {name}. Czytać umiesz? No to się, kurwa, okaże.',
    '{name}, dawaj, ofiaro losu, nie mamy całej nocy!',
    '{name}, rusz dupę. Twoja stara szybciej biegnie na promocję w Biedronce.',
  ],
  speaker: [
    '{name}, jedno słowo. Wiem, że to o jedno więcej, niż masz w głowie.',
    'Głos ma {name}. Zapnijcie pasy, będzie żenada.',
    '{name}, mów, szmato, wszyscy patrzą i już się za Ciebie wstydzą.',
    '{name}, jedno słowo, a nie podcast, do chuja pana.',
    'Teraz {name}. Kłam jak z nut, gnoju, jak w swoim CV.',
    'Kamienna twarz, {name}! Choć z tą mordą i tak nikt Ci nie ufa.',
    '{name}, myśl szybko. Dobra, myśl w ogóle, to wystarczy.',
  ],
  quip: [
    'Patrzcie na tę minę. Albo impostor, albo po prostu tak wygląda.',
    'Impostor już sra w gacie.',
    'Ktoś tu łże jak polityk przed wyborami.',
    'Ale kit, kurwa. Zapakuj go z powrotem do okna.',
    'Spokojnie, nikt tu od Ciebie nie oczekuje inteligencji.',
    'Twoja stara blefuje lepiej, a nawet nie gra.',
    'Pot na czole? Klasyczny impostor. Albo klasyczny debil.',
  ],
  voteStart: [
    'Dość pierdolenia. Wskażcie tę gnidę!',
    'Czas na sąd ostateczny, łachudry. Głosujemy!',
    'Kto tu łże jak pies? Głosujemy, kurwa!',
    'Głosowanie! Wszyscy jesteście podejrzani. I brzydcy.',
  ],
  nudge: [
    ['Rusz dupę!', 'Halo, kurwa, ktoś tu żyje?', 'No dawaj, szmato, czekamy!', 'Myślisz? Nie przemęczaj się, bo zaszkodzi.'],
    [
      'Czas leci, a impostor się z was nabija.',
      'Szybciej, do cholery, bo zasnę.',
      'Ja pierdolę, ślimak już by skończył.',
      'Twoja stara szybciej parkuje, a parkuje godzinę.',
    ],
    ['Dobra, pierdolę to, idę na fajkę.', 'Serio? Szybciej, ślimaki jebane.', 'Zanim skończysz, zdążę się rozwieść.'],
  ],
  hide: [
    'Schowane. Dawaj dalej i nie rób takiej miny, bo wszyscy widzą.',
    'Zapamiętane? To spierdalaj z telefonem dalej.',
    'Gotowe. Telefon dalej, nie ociągaj się, szmato!',
    'Schowane. Twoja twarz właśnie wszystko wypaplała, gratulacje.',
  ],
  roundFirst: [
    'Zaczynamy, kurwa! Niech wygra największy łgarz przy stole.',
    'Jedziemy! Rozejrzyjcie się: jedna z tych mord dzisiaj kłamie.',
  ],
  roundLast: ['Ostatnia runda, kurwa! Teraz albo nigdy.', 'Finał, szmaty! Ostatnia szansa, żeby przestać przegrywać.'],
  roundMid: [
    'Kto tym razem będzie łgał jak pies?',
    'Nowe słowo, nowa gnida.',
    'Ostrzcie języki, łachudry.',
    'Kolejna runda. Przegrani, tym razem spróbujcie myśleć.',
  ],
  turn: [
    'Jeszcze raz, kurwa.',
    'Teraz bez pierdolenia.',
    'Impostor już się poci jak mysz w saunie.',
    'Druga szansa dla tych, co pierdolą głupoty.',
  ],
  decision: [
    'No i co, kurwa? Głosujemy, gramy dalej, czy ktoś strzela?',
    'Decyzja, szmaty! Głosowanie, kolejna tura czy strzał?',
    'No i co, geniusze? Głosujemy czy dalej udajecie, że coś wiecie?',
  ],
  cardReminder: [
    'Zapamiętaj i mordę w kubeł.',
    'Kamienna twarz, kurwa. Nie ta Twoja zwykła głupia mina.',
    'Czytaj powoli, wiem, że litery to dla Ciebie wyzwanie.',
  ],
  voteEntry: [
    'Wskaż tę szmatę po cichu.',
    'Kto tu łże? Stuknij, kurwa, imię.',
    'Głosuj z sercem. I z wkurwem.',
    'Stuknij w najbardziej podejrzaną mordę.',
  ],
  guessConfirm: [
    'Ktoś chce strzelać? To kończy rundę, kurwa. Na pewno?',
    'Strzał kończy rundę. Nie spierdolcie tego.',
  ],
  guessEntry: ['Impostor strzela. Reszta, mordy w kubeł!', 'Jedna próba. Nie spierdol tego, geniuszu.'],
  catch: [
    'Mamy gnidę! {name}, kłamiesz gorzej niż Twoja stara o swoim wieku. {left}',
    'Jest, kurwa! {name} odpada. Poker face jak u ziemniaka. {left}',
    'Zdemaskowano tę szmatę: {name}! {left}',
    '{name}, do kąta i wstydź się. {left}',
  ],
  gameOverOne: [
    'Koniec gry, kurwa! Wygrywa {names}, {score}. Reszta to frajerzy.',
    'Wygrywa {names}, {score}. Reszta może się pocałować w dupę.',
    '{names} wygrywa, {score}. Reszta do domu, przemyśleć swoje życie.',
  ],
  gameOverTie: ['Remis, kurwa! {names}, po {score}.', 'Remis, szmaty! {names} dzielą zwycięstwo, po {score}.'],
  headline: {
    caughtOne: [
      'Mamy Cię, szmato! {names} wpada. Cywile wygrywają.',
      'Koniec pierdolenia, {names}. Z taką mordą nie da się kłamać. Cywile wygrywają!',
      '{names}, kłamiesz jak dziecko z czekoladą na gębie. Cywile wygrywają!',
    ],
    caughtMany: [
      'Mamy was, szmaty! {names} wpadają. Cywile wygrywają.',
      '{names}: najgorszy gang w historii, kurwa. Cywile wygrywają!',
    ],
    escapedOne: [
      'Kurwa, pudło! {names} robi was w chuja. Impostor wygrywa.',
      '{names} wychodzi cało, a wy patrzycie jak krowa na malowane wrota, frajerzy. Impostor wygrywa.',
    ],
    escapedMany: [
      '{names} robią was w chuja! Impostorzy wygrywają.',
      '{names} robią was w balona, a wy, frajerzy, jeszcze klaszczecie. Impostorzy wygrywają.',
    ],
    partial: ['{caught} {falls}, ale {escaped} {escapes} cało. Pół na pół, kurwa.'],
    guessRight: [
      'Kurwa, trafione: {word}! {win}',
      'Ja pierdolę, {word}! Cywile, podpowiadacie lepiej niż sufler. {win}',
    ],
    guessWrong: [
      'Pudło, frajerze! Słowo to: {word}. Cywile wygrywają.',
      'Gówno, nie trafione. {word}, geniuszu. Wracaj do szkoły. Cywile wygrywają.',
    ],
  },
}
