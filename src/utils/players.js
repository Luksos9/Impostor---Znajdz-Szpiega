// Player helpers. Pure functions, no React.

import { shuffle } from './shuffle'

export const MIN_PLAYERS = 3
export const MAX_PLAYERS = 8
export const MAX_NAME_LENGTH = 14

// Chance that an impostor ends up speaking first. Low on purpose: the first
// speaker has no context to hide behind, so an impostor there is a rare treat.
export const IMPOSTOR_FIRST_CHANCE = 0.05

const clampCount = (count) =>
  Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, Math.floor(count) || MIN_PLAYERS))

// Build a roster of `count` players. Names come from `savedNames` (what the
// group typed last time) and are otherwise empty — the user always types them.
export function emptyRoster(count, savedNames = []) {
  const n = clampCount(count)
  return Array.from({ length: n }, (_, i) => ({
    id: `p-${i + 1}`,
    name: typeof savedNames[i] === 'string' ? savedNames[i] : '',
  }))
}

// Resize an existing roster. Players that stay keep their names; new slots are empty.
export function resizeRoster(currentRoster, count) {
  const n = clampCount(count)
  if (currentRoster.length === n) return currentRoster
  if (currentRoster.length > n) return currentRoster.slice(0, n)
  const result = [...currentRoster]
  for (let i = currentRoster.length; i < n; i++) {
    result.push({ id: `p-${i + 1}`, name: '' })
  }
  return result
}

// Update one player's name while typing. Strips emoji, drops leading spaces and
// caps the length. Deliberately does NOT fall back to the old name on empty
// input — people need to be able to clear a field and retype it.
export function renamePlayer(roster, playerId, nextName) {
  const sanitized = (nextName || '')
    .replace(/\p{Emoji_Presentation}/gu, '')
    .replace(/^\s+/, '')
    .slice(0, MAX_NAME_LENGTH)
  return roster.map((p) => (p.id === playerId ? { ...p, name: sanitized } : p))
}

// Trim names for the game itself (typing keeps trailing spaces, play does not).
export function finalizeRoster(roster) {
  return roster.map((p) => ({ ...p, name: p.name.trim() }))
}

// Validate a roster: size, every name filled in, no two names alike.
// Returns { ok, error } where `error` is a Polish message or null.
export function validateRoster(players) {
  if (!Array.isArray(players)) return { ok: false, error: 'Brak graczy' }
  if (players.length < MIN_PLAYERS) return { ok: false, error: `Minimum ${MIN_PLAYERS} graczy` }
  if (players.length > MAX_PLAYERS) return { ok: false, error: `Maksymalnie ${MAX_PLAYERS} graczy` }
  const names = players.map((p) => p.name.trim())
  if (names.some((n) => n === '')) return { ok: false, error: 'Wpisz imiona wszystkich graczy' }
  const seen = new Set()
  for (const n of names) {
    const key = n.toLocaleLowerCase('pl-PL')
    if (seen.has(key)) return { ok: false, error: 'Imiona muszą być różne' }
    seen.add(key)
  }
  return { ok: true, error: null }
}

// How many impostors a lobby of `playerCount` can have. Keeps a clear
// civilian majority: 3-4 → 1, 5-6 → 2, 7-8 → 3.
export function maxImpostors(playerCount) {
  return Math.max(1, Math.floor((playerCount - 1) / 2))
}

// Pick one random player to be the impostor.
export function pickImpostor(players) {
  if (!players || players.length === 0) return null
  const idx = Math.floor(Math.random() * players.length)
  return players[idx]
}

// Pick `count` distinct impostors (clamped to what the lobby allows).
export function pickImpostors(players, count = 1) {
  if (!players || players.length === 0) return []
  const n = Math.max(1, Math.min(count, maxImpostors(players.length)))
  return shuffle(players)
    .slice(0, n)
    .map((p) => p.id)
}

// Speaking / reveal order. An impostor goes first only ~5% of the time;
// everyone else is shuffled into the remaining slots.
export function makeSpeakerOrder(players, impostorIds, firstImpostorChance = IMPOSTOR_FIRST_CHANCE) {
  const impostorSet = new Set(impostorIds)
  const impostors = shuffle(players.filter((p) => impostorSet.has(p.id)))
  const civilians = shuffle(players.filter((p) => !impostorSet.has(p.id)))
  const pool = shuffle(players)
  if (impostors.length === 0 || civilians.length === 0) return pool.map((p) => p.id)

  const impostorFirst = Math.random() < firstImpostorChance
  const first = impostorFirst ? impostors[0] : civilians[0]
  const rest = shuffle(pool.filter((p) => p.id !== first.id))
  return [first, ...rest].map((p) => p.id)
}
