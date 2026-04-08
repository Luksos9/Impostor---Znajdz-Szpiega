// Pack aggregator. v1 ships with Domówka only.
// The shape supports adding more packs later without refactoring callers.

import { DOMOWKA } from './domowka'

export const ALL_PACKS = [DOMOWKA]

// Returns every content item for `modeId` across all packs.
// Callers filter by `usedContentIds` themselves for anti-repeat within a session.
export function getContentForMode(modeId) {
  return ALL_PACKS.flatMap((p) => p.content[modeId] || [])
}
