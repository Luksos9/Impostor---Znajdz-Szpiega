// Content picker with session-level anti-repeat.
// Filters out any content id already used in the current game.
// When the pool is exhausted, returns null and the caller can clear usedIds and retry.

import { shuffle } from './shuffle'
import { getContentForMode } from '../data/packs'

// Pick one unused item for `modeId`. Returns { item, poolExhausted }.
// `usedIds` is an array of content ids already used in this game.
export function pickContent(modeId, usedIds = []) {
  const all = getContentForMode(modeId)
  if (!all || all.length === 0) {
    return { item: null, poolExhausted: true }
  }
  const usedSet = new Set(usedIds)
  const unused = all.filter((c) => !usedSet.has(c.id))
  if (unused.length === 0) {
    // Pool exhausted: callers should clear used and retry.
    // For v1 we auto-pick from the full pool.
    const shuffled = shuffle(all)
    return { item: shuffled[0], poolExhausted: true }
  }
  const shuffled = shuffle(unused)
  return { item: shuffled[0], poolExhausted: false }
}
