// Round-granular game resume. iOS kills standalone PWAs freely (memory, long
// background, a phone call); without this the whole game's scores vanish.
//
// Only the app-level state is saved (mode, players, scores, round, used words)
// after every completed round. The round in progress restarts fresh on resume —
// deliberately: persisting it would mean writing the secret word and the
// impostor's identity to storage and re-hydrating every mode's phase machine.

const KEY = 'imposter.session'
const MAX_AGE_MS = 12 * 60 * 60 * 1000 // a party is over by then

export function saveSession({ modeId, players, game }) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ v: 1, savedAt: Date.now(), modeId, players, game }))
  } catch { /* storage full or blocked — resume is a nicety */ }
}

export function clearSession() {
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
}

// Returns a valid, unfinished session or null (and discards stale/corrupt ones).
export function loadSession() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null')
    const ok =
      s && s.v === 1 && s.modeId && Array.isArray(s.players) && s.players.length >= 3 &&
      s.game && s.game.currentRound < s.game.totalRounds &&
      Date.now() - s.savedAt < MAX_AGE_MS
    if (!ok) {
      if (s) clearSession()
      return null
    }
    return s
  } catch {
    clearSession()
    return null
  }
}
