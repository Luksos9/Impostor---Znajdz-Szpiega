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
    .replace(/ł/g, 'l') // NFD does not decompose ł, so handle it explicitly
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// Edit distance (insert / delete / substitute) between two short strings.
function editDistance(a, b) {
  if (a === b) return 0
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let diagonal = prev[0]
    prev[0] = i
    for (let j = 1; j <= b.length; j++) {
      const up = prev[j]
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1))
      diagonal = up
    }
  }
  return prev[b.length]
}

// Compare two strings for a word-guess match. Forgiving on purpose — the
// guesser is typing on a phone while the table watches:
//   1. exact (case-insensitive), 2. ignoring Polish diacritics (incl. ł),
//   3. one whole word of a multi-word secret ("ogórek" for "OGÓREK KISZONY"),
//   4. a single typo, for words of 5+ letters.
export function compareWordGuess(guess, truth) {
  if (typeof guess !== 'string' || typeof truth !== 'string') return false
  const g = normalizePolishForCompare(guess)
  const t = normalizePolishForCompare(truth)
  if (!g || !t) return false
  if (g === t) return true

  const truthWords = t.split(' ')
  if (truthWords.length > 1 && truthWords.some((w) => w.length >= 4 && w === g)) return true

  const withinOneTypo = (x, y) => Math.min(x.length, y.length) >= 5 && editDistance(x, y) <= 1
  if (withinOneTypo(g, t)) return true
  if (truthWords.length > 1 && truthWords.some((w) => withinOneTypo(g, w))) return true
  return false
}

// Vote tally over CIVILIANS' votes only. Impostors may vote for anyone (even to
// muddy the water), but the table's verdict is what the catch rule counts.
// Returns { counts, accused, topCount, tie }. `accused` is null on a tie.
export function tallyCivilianVotes(votes, impostorIds) {
  const impostorSet = new Set(impostorIds)
  const counts = {}
  for (const [voterId, targetId] of Object.entries(votes)) {
    if (impostorSet.has(voterId)) continue
    counts[targetId] = (counts[targetId] || 0) + 1
  }
  const entries = Object.entries(counts)
  const topCount = entries.reduce((m, [, c]) => Math.max(m, c), 0)
  const leaders = entries.filter(([, c]) => c === topCount).map(([id]) => id)
  const tie = leaders.length > 1
  return { counts, accused: topCount > 0 && !tie ? leaders[0] : null, topCount, tie }
}

// How many civilians must name an impostor to catch them: strictly more than half.
export function votesNeededToCatch(civilianCount) {
  return Math.floor(civilianCount / 2) + 1
}

// +points to every civilian (used when an impostor's word guess fails).
export function awardCivilians(scores, playerIds, impostorIds, points = 1) {
  const next = { ...scores }
  const impostorSet = new Set(impostorIds)
  for (const id of playerIds) {
    if (!impostorSet.has(id)) next[id] = (next[id] || 0) + points
  }
  return next
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
