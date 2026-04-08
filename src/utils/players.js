// Player helpers. Pure functions, no React.

import { shuffle } from './shuffle'

// Funny Polish nicknames pool. Used as defaults so a fresh game feels playful
// instead of "Gracz 1, Gracz 2". Picked at random per session via shuffle().
// Pool is intentionally bigger than the max player count (8) so 8-player games
// don't feel like a fixed lineup.
export const FUNNY_NAMES = [
  'Bałwan',
  'Pączek',
  'Żurek',
  'Cukinia',
  'Kapeć',
  'Smerf',
  'Kotleciara',
  'Mleczarz',
  'Żaba',
  'Burak',
  'Korniszon',
  'Pierogi',
  'Kompot',
  'Kluska',
  'Maślak',
  'Pyza',
  'Knedel',
  'Bigos',
  'Kaszanka',
  'Hultaj',
  'Łobuz',
  'Ferdek',
  'Kaczor',
  'Mietek',
  'Truskawka',
  'Mandarynka',
  'Ananas',
  'Kaktus',
  'Pingwin',
  'Chomik',
  'Pączuś',
  'Kapuśniak',
  'Babcia Krysia',
  'Wujek Heniek',
  'Sąsiad Janusz',
]

// Generate `count` auto-named players using funny Polish nicknames.
// Each player gets a stable id so React keys stay consistent across re-renders.
// The shuffle is fresh per call so re-rolling player count picks new names.
export function autoGeneratePlayers(count) {
  const n = Math.max(3, Math.min(8, Math.floor(count) || 3))
  const picks = shuffle(FUNNY_NAMES).slice(0, n)
  const result = []
  for (let i = 0; i < n; i++) {
    result.push({
      id: `p-${i + 1}`,
      name: picks[i] || `Gracz ${i + 1}`,
    })
  }
  return result
}

// Resize an existing roster to `count`. Preserves names+ids of the players that
// stay, and pads with fresh funny names that aren't already in use. Used by
// QuickSetup so the user's edits survive flipping the player count up/down.
export function resizeRoster(currentRoster, count) {
  const n = Math.max(3, Math.min(8, Math.floor(count) || 3))
  if (currentRoster.length === n) return currentRoster
  if (currentRoster.length > n) {
    return currentRoster.slice(0, n)
  }
  const usedNames = new Set(currentRoster.map((p) => p.name))
  const availableNames = shuffle(FUNNY_NAMES).filter((nm) => !usedNames.has(nm))
  const result = [...currentRoster]
  for (let i = currentRoster.length; i < n; i++) {
    const fallback = availableNames.shift() || `Gracz ${i + 1}`
    result.push({
      id: `p-${i + 1}`,
      name: fallback,
    })
  }
  return result
}

// Update one player's name in a roster. Returns a new array.
// Empty/whitespace input falls back to a funny name to avoid crash on submit.
export function renamePlayer(roster, playerId, nextName) {
  const trimmed = (nextName || '').trim()
  return roster.map((p) =>
    p.id === playerId ? { ...p, name: trimmed || p.name } : p
  )
}

// Validate a roster for size. 3 ≤ length ≤ 8.
// Returns { ok: boolean, error: string | null }.
export function validateRoster(players) {
  if (!Array.isArray(players)) return { ok: false, error: 'Brak graczy' }
  if (players.length < 3) return { ok: false, error: 'Minimum 3 graczy' }
  if (players.length > 8) return { ok: false, error: 'Maksymalnie 8 graczy' }
  return { ok: true, error: null }
}

// Pick one random player to be the impostor.
export function pickImpostor(players) {
  if (!players || players.length === 0) return null
  const idx = Math.floor(Math.random() * players.length)
  return players[idx]
}
