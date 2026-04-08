// Player helpers. Pure functions, no React.

// Generate `count` auto-named players: Gracz 1, Gracz 2, ...
// Each player gets a stable id so React keys stay consistent across re-renders.
export function autoGeneratePlayers(count) {
  const n = Math.max(3, Math.min(8, Math.floor(count) || 3))
  const result = []
  for (let i = 1; i <= n; i++) {
    result.push({
      id: `p-${i}`,
      name: `Gracz ${i}`,
    })
  }
  return result
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
