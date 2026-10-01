// Pack aggregator. Packs are mixed together so rounds stay varied.
// The shape supports adding more packs later without refactoring callers.

import { DOMOWKA } from './domowka'
import { SMIESZKI } from './smieszki'

export const ALL_PACKS = [DOMOWKA, SMIESZKI]

// Returns every content item for `modeId` across all packs.
// Callers filter by `usedContentIds` themselves for anti-repeat within a session.
export function getContentForMode(modeId) {
  return ALL_PACKS.flatMap((p) => p.content[modeId] || [])
}
