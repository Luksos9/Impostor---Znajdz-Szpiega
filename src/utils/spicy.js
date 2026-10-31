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
    '{name}, łap telefon, ty ludzki odpowiedniku mokrej skarpety w sandale!',
    '{name}, podejdź tu z godnością, której nie masz, i weź to cholerne urządzenie!',
    'Telefon dla: {name}. Reszta oczy w podłogę, bo ten widok jest bardziej obrzydliwy niż kebab o czwartej nad ranem.',
    '{name}, dawaj łapska, kurwa mać, ruszasz się jak parówka w mikrofalówce!',
    '{name}, Twoja kolej, ty ambasadorze mierności. Postaraj się nie zepsuć telefonu samym patrzeniem.',
    '{name}, bierz telefon, ty poczekalnio do piekła, i nie rozlej na niego swojej osobowości!',
    'Kurwa, {name}, rusz tyłek z fotela, bo zaraz zapuścisz tam korzenie i dostaniesz nazwę łacińską!',
  ],
  speaker: [
    '{name}, jedno słowo. Wiem, że to o jedno więcej, niż masz w głowie.',
    'Głos ma {name}. Zapnijcie pasy, będzie żenada.',
    '{name}, mów, szmato, wszyscy patrzą i już się za Ciebie wstydzą.',
    '{name}, jedno słowo, a nie podcast, do chuja pana.',
    'Teraz {name}. Kłam jak z nut, gnoju, jak w swoim CV.',
    'Kamienna twarz, {name}! Choć z tą mordą i tak nikt Ci nie ufa.',
    '{name}, myśl szybko. Dobra, myśl w ogóle, to wystarczy.',
    '{name}, jedno słowo. Jedno, ty chodząca awaria Wi-Fi w środku ważnego meczu!',
    'Głos ma {name}. Zapnijcie pasy i zmówcie pacierz, bo zaraz będzie żenada w czterech aktach.',
    '{name}, mów, kurwa, jak człowiek, a nie jak lodówka, która próbuje składać zeznania!',
    '{name}, opisz hasło jednym słowem, ty tragiczny wynalazku natury, i niech Ci Bozia da mózg w gratisie.',
    'Teraz {name}. Kłam jak z nut, ty zapomniany gwoździu w ścianie ludzkości, bo przegrasz jak zawsze!',
    '{name}, gadaj, szmato, albo zrobię z Twojej przyszłości memes na grupie rodzinnej!',
    '{name}, jedno słowo i ani sylaby więcej, ty marna imitacjo człowieka od niedzieli na promocji w Lidlu!',
  ],
  quip: [
    'Patrzcie na tę minę. Albo impostor, albo po prostu tak wygląda.',
    'Impostor już sra w gacie.',
    'Ktoś tu łże jak polityk przed wyborami.',
    'Ale kit, kurwa. Zapakuj go z powrotem do okna.',
    'Spokojnie, nikt tu od Ciebie nie oczekuje inteligencji.',
    'Twoja stara blefuje lepiej, a nawet nie gra.',
    'Pot na czole? Klasyczny impostor. Albo klasyczny debil.',
    'Ten pot na czole to nie upał, to czysty, nieskażony strach przed prawdą.',
    'Ktoś tu łże tak bezczelnie, że aż jaja się same z tego śmieją.',
    'Ta mina to albo impostor, albo pan, który właśnie zorientował się, że zostawił żelazko włączone.',
    'Ale cyrk, kurwa, ale cyrk. Brakuje tylko słonia i dyrektora.',
    'Ktoś tu pierdoli tak sprawnie, że aż mi się łezka w oku kręci.',
    'Wyczuwam tu zapach ściemy, jak pod mostem w wieczór sylwestrowy.',
    'Nic nie mówicie, ale Wasze twarze krzyczą jak karp w wannie w Wigilię.',
  ],
  voteStart: [
    'Dość pierdolenia. Wskażcie tę gnidę!',
    'Czas na sąd ostateczny, łachudry. Głosujemy!',
    'Kto tu łże jak pies? Głosujemy, kurwa!',
    'Głosowanie! Wszyscy jesteście podejrzani. I brzydcy.',
    'Dość tego pierdolenia, głosujemy, bo mi ciśnienie skacze jak cena jajek!',
    'Czas na sąd ostateczny, szmaty. Wskażcie tego jednego, kurwa, co Was robi w balona!',
    'Głosowanie! Pokażcie palcem winowajcę, jak w piątej klasie, kiedy ktoś puścił bąka!',
  ],
  nudge: [
    [
      'Rusz dupę!',
      'Halo, kurwa, ktoś tu żyje?',
      'No dawaj, szmato, czekamy!',
      'Myślisz? Nie przemęczaj się, bo zaszkodzi.',
      'Rusz dupę, kurwa, bo Cię zagłosuję na impostora z samej nudy!',
      'Halo, żyjesz? Mrugnij, jak Cię porwali!',
    ],
    [
      'Czas leci, a impostor się z was nabija.',
      'Szybciej, do cholery, bo zasnę.',
      'Ja pierdolę, ślimak już by skończył.',
      'Twoja stara szybciej parkuje, a parkuje godzinę.',
      'Szybciej, szmato, bo zdążę przeczytać całą Biblię i jeszcze dopisać komentarz!',
      'Ja pierdolę, ślimak z kulą u nogi byłby już po wszystkim.',
      'Liczysz, że czas stanie w miejscu? On, kurwa, nie stoi nawet dla papieża.',
    ],
    [
      'Dobra, pierdolę to, idę na fajkę.',
      'Serio? Szybciej, ślimaki jebane.',
      'Zanim skończysz, zdążę się rozwieść.',
      'Dobra, pierdolę to, wychodzę po fajki, a wy macie się tu nie zesrać z tej bezradności.',
      'Serio? Moja babcia po udarze szybciej wciska guziki, a ma dziewięćdziesiąt trzy lata.',
      'Zanim skończysz, zdążę założyć firmę, zbankrutować i zacząć od nowa.',
    ],
  ],
  hide: [
    'Schowane. Dawaj dalej i nie rób takiej miny, bo wszyscy widzą.',
    'Zapamiętane? To spierdalaj z telefonem dalej.',
    'Gotowe. Telefon dalej, nie ociągaj się, szmato!',
    'Schowane. Twoja twarz właśnie wszystko wypaplała, gratulacje.',
    'Schowane. Dawaj dalej, bo Twoja twarz wygląda jak dowód winy na rozprawie sądowej.',
    'Zapamiętane? To spierdalaj z tym telefonem prędzej niż rząd z obietnicami.',
    'Gotowe. Telefon dalej, szmato, i nie rób tej miny, bo wszystko widać jak na dłoni.',
  ],
  roundFirst: [
    'Zaczynamy, kurwa! Niech wygra największy łgarz przy stole.',
    'Jedziemy! Rozejrzyjcie się: jedna z tych mord dzisiaj kłamie.',
    'Zaczynamy, kurwa! Niech wygra największy łgarz, a reszta niech idzie płakać do poduszki.',
    'Jedziemy z tym koksem! Dziś któryś z Was zostanie królem ściemy, a reszta błaznami dworskimi.',
  ],
  roundLast: [
    'Ostatnia runda, kurwa! Teraz albo nigdy.',
    'Finał, szmaty! Ostatnia szansa, żeby przestać przegrywać.',
    'Ostatnia runda, szmaty! Teraz wyjdzie, kto tu jest królem ściemy, a kto pierdoloną dekoracją.',
    'Finał, kurwa! Zakasajcie rękawy, bo ktoś dzisiaj zamknie ten dzień z honorem, a reszta z hańbą.',
  ],
  roundMid: [
    'Kto tym razem będzie łgał jak pies?',
    'Nowe słowo, nowa gnida.',
    'Ostrzcie języki, łachudry.',
    'Kolejna runda. Przegrani, tym razem spróbujcie myśleć.',
    'Nowa runda, nowe słowo, nowa szansa, żeby się skompromitować przed znajomymi!',
    'Kto tym razem będzie pierdolił jak potłuczony? Zakładajcie się, kurwa, o piwo!',
    'Ostrzcie języki, łachudry, bo ta runda będzie jak wesele: głośna, tłusta i pełna kłamstw.',
  ],
  turn: [
    'Jeszcze raz, kurwa.',
    'Teraz bez pierdolenia.',
    'Impostor już się poci jak mysz w saunie.',
    'Druga szansa dla tych, co pierdolą głupoty.',
    'Jeszcze raz, kurwa. Tym razem postarajcie się, jak na własnym pogrzebie.',
    'Druga tura! Dla tych, co za pierwszym razem nie zdążyli się skompromitować.',
    'Impostor już się poci jak mysz w saunie, a wy dalej udajecie, że coś wiecie.',
  ],
  decision: [
    'No i co, kurwa? Głosujemy, gramy dalej, czy ktoś strzela?',
    'Decyzja, szmaty! Głosowanie, kolejna tura czy strzał?',
    'No i co, geniusze? Głosujemy czy dalej udajecie, że coś wiecie?',
    'No i co, geniusze od siedmiu boleści? Głosujecie, gracie dalej, czy ktoś wreszcie strzela?',
    'Decyzja, szmaty! Głosowanie, kolejna tura czy strzał? Tylko szybciej, bo mi się ulewa ze starości.',
  ],
  cardReminder: [
    'Zapamiętaj i mordę w kubeł.',
    'Kamienna twarz, kurwa. Nie ta Twoja zwykła głupia mina.',
    'Czytaj powoli, wiem, że litery to dla Ciebie wyzwanie.',
    'Zapamiętaj to jak własne imię i nikomu ani słowa, bo Cię wpierdolimy w tym zakresie.',
    'Czytaj powoli, ty ambitny analfabeto, i zrób poker face, jakby Ci właśnie wypłacili sto tysięcy.',
    'Tylko dla Ciebie. Kamienna twarz, kurwa, jak pomnik na rondzie.',
  ],
  voteEntry: [
    'Wskaż tę szmatę po cichu.',
    'Kto tu łże? Stuknij, kurwa, imię.',
    'Głosuj z sercem. I z wkurwem.',
    'Stuknij w najbardziej podejrzaną mordę.',
    'Wskaż tę szmatę po cichu, jak szpieg w kiepskim kinie akcji.',
    'Stuknij w imię tego, kto Twoim zdaniem robi nas wszystkich w ciula. Czas na zemstę!',
    'Głosuj z wkurwem, z sercem i z lekką nutą żądzy zemsty.',
  ],
  guessConfirm: [
    'Ktoś chce strzelać? To kończy rundę, kurwa. Na pewno?',
    'Strzał kończy rundę. Nie spierdolcie tego.',
    'Ktoś chce strzelać? To kończy rundę, kurwa! Na pewno chcecie ryzykować ten honor, co Wam został?',
    'Strzał kończy rundę. Jeśli to spieprzycie, hańba będzie trwała dłużej niż rodzinne obiady.',
  ],
  guessEntry: [
    'Impostor strzela. Reszta, mordy w kubeł!',
    'Jedna próba. Nie spierdol tego, geniuszu.',
    'Impostor strzela. Reszta, mordy w kubeł, bo trwa ostatnia próba odkupienia!',
    'Jedna próba, geniuszu. Postaraj się nie spieprzyć jej tak, jak wszystkiego innego w życiu.',
  ],
  catch: [
    'Mamy gnidę! {name}, kłamiesz gorzej niż Twoja stara o swoim wieku. {left}',
    'Jest, kurwa! {name} odpada. Poker face jak u ziemniaka. {left}',
    'Zdemaskowano tę szmatę: {name}! {left}',
    '{name}, do kąta i wstydź się. {left}',
    'Mamy tę gnidę! {name}, Twoje kłamstwa pachniały jak szambo w lipcu. {left}',
    'Jest, kurwa mać! {name} odpada, a jego plan rozpadł się jak sucha bułka w mleku. {left}',
    '{name}, zdemaskowano Cię jak dziecko ukrywające czekoladę na gębie. {left}',
    '{name} wylatuje z hukiem, jak ostatni pierdzący w windzie. {left}',
  ],
  gameOverOne: [
    'Koniec gry, kurwa! Wygrywa {names}, {score}. Reszta to frajerzy.',
    'Wygrywa {names}, {score}. Reszta może się pocałować w dupę.',
    '{names} wygrywa, {score}. Reszta do domu, przemyśleć swoje życie.',
    'Koniec gry, kurwa! Wygrywa {names}, {score}. Reszta może iść się przytulić do własnej porażki.',
    '{names} wygrywa, {score}. Reszta na kolana i niech żałuje, że w ogóle zaczęła ten pojedynek.',
    'Wygrywa {names}, {score}. A Wy, frajerzy, wróćcie do domu i przemyślcie swoje fatalne życiowe wybory.',
  ],
  gameOverTie: [
    'Remis, kurwa! {names}, po {score}.',
    'Remis, szmaty! {names} dzielą zwycięstwo, po {score}.',
    'Remis, kurwa! {names}, po {score}. Dwa ślimaki na mecie, żaden nie zasługuje na medal.',
    'Remis, szmaty! {names} dzielą zwycięstwo, po {score}. Wspólna wygrana, wspólna żenada.',
  ],
  headline: {
    caughtOne: [
      'Mamy Cię, szmato! {names} wpada. Cywile wygrywają.',
      'Koniec pierdolenia, {names}. Z taką mordą nie da się kłamać. Cywile wygrywają!',
      '{names}, kłamiesz jak dziecko z czekoladą na gębie. Cywile wygrywają!',
      'Mamy Cię, szmato! {names} wpada jak śliwka w kompot. Cywile wygrywają i tańczą na grobie jego kłamstw!',
      '{names}, Twoje kłamstwa mają krótsze nogi niż jamnik po wypadku. Cywile wygrywają!',
    ],
    caughtMany: [
      'Mamy was, szmaty! {names} wpadają. Cywile wygrywają.',
      '{names}: najgorszy gang w historii, kurwa. Cywile wygrywają!',
      'Mamy Was, szmaty! {names} wpadają jak muchy do szamba. Cywile wygrywają!',
      '{names}: najgorszy gang w historii, kurwa. Cywile wygrywają i śmieją się Wam w twarz!',
    ],
    escapedOne: [
      'Kurwa, pudło! {names} robi was w chuja. Impostor wygrywa.',
      '{names} wychodzi cało, a wy patrzycie jak krowa na malowane wrota, frajerzy. Impostor wygrywa.',
      '{names} wychodzi cało, a Wy, frajerzy, jeszcze mu przy tym klaszczecie jak małpy w cyrku. Impostor wygrywa!',
      'Kurwa, pudło za pudłem! {names} robi z Was balona i jeszcze mu się podoba. Impostor wygrywa!',
    ],
    escapedMany: [
      '{names} robią was w chuja! Impostorzy wygrywają.',
      '{names} robią was w balona, a wy, frajerzy, jeszcze klaszczecie. Impostorzy wygrywają.',
      '{names} robią Was w ciula z gracją baleriny, a Wy, frajerzy, patrzycie jak krowy na malowane wrota. Impostorzy wygrywają!',
      '{names} wychodzą cało i śmieją się z Was jak z kabaretu. Impostorzy wygrywają!',
    ],
    partial: [
      '{caught} {falls}, ale {escaped} {escapes} cało. Pół na pół, kurwa.',
      '{caught} {falls}, ale {escaped} {escapes} cało. Pół na pół, jak kebab z sosem i chujem.',
      '{caught} {falls}, a {escaped} {escapes} cało i śmieje się z Was w kułak. Pół na pół, kurwa.',
    ],
    guessRight: [
      'Kurwa, trafione: {word}! {win}',
      'Ja pierdolę, {word}! Cywile, podpowiadacie lepiej niż sufler. {win}',
      'Kurwa, trafione: {word}! A to ci pizda, impostor wyczaił to jak wyczulony ogar. {win}',
      'Ja pierdolę, {word}! Cywile, podpowiadacie lepiej niż sufler w operze. {win}',
    ],
    guessWrong: [
      'Pudło, frajerze! Słowo to: {word}. Cywile wygrywają.',
      'Gówno, nie trafione. {word}, geniuszu. Wracaj do szkoły. Cywile wygrywają.',
      'Pudło, frajerze! Słowo to: {word}. Nawet moja babcia by trafiła, a ona widzi tylko kolory. Cywile wygrywają!',
      'Gówno, nie trafione. {word}, geniuszu. Wracaj do przedszkola i ucz się od nowa. Cywile wygrywają!',
    ],
  },
}
