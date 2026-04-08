// Scoring helpers. Pure functions. No mutation: every award returns a NEW scores object.
// Shared across all modes so delta math lives in one place.

// Add `points` to the score of every player in `impostorIds`.
export function awardImpostorSurvival(scores, impostorIds, points = 2) {
  const next = { ...scores }
  for (const id of impostorIds) {
    next[id] = (next[id] || 0) + points
  }
  return next
}

// `votes` is a map { voterId: targetId }. Each voter whose target is in `impostorIds` gets +points.
export function awardCorrectVoters(scores, votes, impostorIds, points = 1) {
  const next = { ...scores }
  const impostorSet = new Set(impostorIds)
  for (const [voterId, targetId] of Object.entries(votes)) {
    if (impostorSet.has(targetId)) {
      next[voterId] = (next[voterId] || 0) + points
    }
  }
  return next
}

// Impostor correctly guessed the secret word (Klasyczny, Kameleon). +points to every impostor.
export function awardImpostorWordGuess(scores, impostorIds, points = 3) {
  const next = { ...scores }
  for (const id of impostorIds) {
    next[id] = (next[id] || 0) + points
  }
  return next
}

// Merge a deltas object into scores without mutating.
export function applyDeltas(scores, deltas) {
  const next = { ...scores }
  for (const [id, delta] of Object.entries(deltas)) {
    next[id] = (next[id] || 0) + delta
  }
  return next
}

// Normalize Polish text for fuzzy comparison.
// Exact match should be tried first. Use this as a fallback:
//   normalizePolishForCompare('żółw') === normalizePolishForCompare('ZÓLW') // true
//   normalizePolishForCompare('Kot ') === normalizePolishForCompare('kot')  // true
export function normalizePolishForCompare(str) {
  if (typeof str !== 'string') return ''
  return str
    .toLocaleLowerCase('pl-PL')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

// Compare two strings for a word-guess match.
// Exact comparison first, then normalized fallback.
export function compareWordGuess(guess, truth) {
  if (typeof guess !== 'string' || typeof truth !== 'string') return false
  if (guess.trim().toLocaleLowerCase('pl-PL') === truth.trim().toLocaleLowerCase('pl-PL')) return true
  return normalizePolishForCompare(guess) === normalizePolishForCompare(truth)
}

// Vote tally helper. Returns { [candidateId]: count } plus the accused (most-voted).
// Ties resolved by returning the first candidate with the max count — callers use
// `wasCaught` to check if a specific impostor was voted for by a strict majority.
export function tallyVotes(votes) {
  const counts = {}
  for (const targetId of Object.values(votes)) {
    counts[targetId] = (counts[targetId] || 0) + 1
  }
  let accused = null
  let max = 0
  for (const [id, count] of Object.entries(counts)) {
    if (count > max) {
      max = count
      accused = id
    }
  }
  return { counts, accused, topCount: max }
}

// Klasyczny / Kameleon catch rule: strictly MORE than half of non-impostors voted for an impostor.
// `votes` is { voterId: targetId }. `impostorIds` is an array.
// Returns true if the impostor was caught.
export function impostorCaughtByMajority(votes, impostorIds) {
  const impostorSet = new Set(impostorIds)
  const nonImpostorVoters = Object.keys(votes).filter((id) => !impostorSet.has(id))
  if (nonImpostorVoters.length === 0) return false
  const votesAgainstImpostor = nonImpostorVoters.filter((voterId) =>
    impostorSet.has(votes[voterId])
  ).length
  return votesAgainstImpostor * 2 > nonImpostorVoters.length
}
