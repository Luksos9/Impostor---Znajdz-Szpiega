// Mode registry. Single source of truth for mode metadata.
// Components attach as each mode ships (M3: classic, M4: pairsQuestion, M5: kameleon).
// Menu reads rank/label/blurb/minPlayers to render the mode picker.

import ModeClassic from '../components/modes/ModeClassic'
import ModePairsQuestion from '../components/modes/ModePairsQuestion'
import ModeKameleon from '../components/modes/ModeKameleon'

export const MODE_REGISTRY = [
  {
    id: 'classic',
    rank: 'hero',
    label: 'Klasyczny impostor',
    blurb: 'Opisuj słowo, znajdź impostora',
    minPlayers: 3,
    Component: ModeClassic,
  },
  {
    id: 'pairsQuestion',
    rank: 'secondary',
    label: 'Kto ma inne pytanie?',
    blurb: 'Napisz, ujawnij, głosuj',
    minPlayers: 3,
    Component: ModePairsQuestion,
  },
  {
    id: 'kameleon',
    rank: 'secondary',
    label: 'Kameleon',
    blurb: 'Siatka 16 słów, jedno tajne',
    minPlayers: 3,
    Component: ModeKameleon,
  },
]

export const getMode = (id) => MODE_REGISTRY.find((m) => m.id === id)
