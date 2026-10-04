// Classic mode with one or more impostors: impostors are caught ONE AT A TIME.
//
// Each vote can expose at most one player. A player is exposed when more than
// half of the civilians name them, and they are an impostor. Then the table
// decides: play another describe turn, or vote again for the next impostor.
// A vote that exposes nobody (votes split, or the table named a civilian) ends
// the round and every impostor still hidden escapes.
//
// Every impostor is scored on their own, so one impostor saying a bad word no
// longer sinks the whole team. With a single impostor this is exactly the old
// rule ("more than half of the civilians name the impostor").
//
// Pure functions, no React.

import { tallyCivilianVotes, votesNeededToCatch } from './scoring'

// Resolve one vote. `votes` is { voterId: targetId } from the players still in play.
export function resolveVote({ votes, impostorIds, caughtIds = [], civilianCount }) {
  const hidden = impostorIds.filter((id) => !caughtIds.includes(id))
  const { counts, accused, topCount, tie } = tallyCivilianVotes(votes, impostorIds)
  const needed = votesNeededToCatch(civilianCount)
  const majority = accused !== null && topCount >= needed
  const caughtId = majority && hidden.includes(accused) ? accused : null
  // Who the vote landed on (a civilian, if the table got it wrong).
  const accusedId = majority ? accused : null
  // Civilians who named the exposed impostor earn a point for this vote.
  const hitVoterIds = caughtId
    ? Object.entries(votes)
        .filter(([voterId, target]) => !impostorIds.includes(voterId) && target === caughtId)
        .map(([voterId]) => voterId)
    : []
  return {
    caughtId,
    accusedId,
    wrongAccusation: majority && !caughtId,
    tie,
    topCount,
    needed,
    counts,
    hitVoterIds,
    votes,
  }
}

// Final scoring for the round.
//   voteLog: results of resolveVote, in order
//   reason:  'all-caught' | 'vote-failed' | 'guess-right' | 'guess-wrong'
export function scoreRound({ players, impostorIds, voteLog, reason }) {
  const deltas = Object.fromEntries(players.map((p) => [p.id, 0]))
  const caughtIds = voteLog.map((v) => v.caughtId).filter(Boolean)
  const hiddenIds = impostorIds.filter((id) => !caughtIds.includes(id))
  const civilianIds = players.map((p) => p.id).filter((id) => !impostorIds.includes(id))

  for (const v of voteLog) for (const id of v.hitVoterIds) deltas[id] += 1

  if (reason === 'vote-failed') for (const id of hiddenIds) deltas[id] += 2
  if (reason === 'guess-right') for (const id of hiddenIds) deltas[id] += 3
  if (reason === 'guess-wrong') for (const id of civilianIds) deltas[id] += 1

  const impostorsScored = reason === 'vote-failed' || reason === 'guess-right'
  const winner = !impostorsScored ? 'civilians' : caughtIds.length > 0 ? 'mixed' : 'impostors'
  return { deltas, winner, caughtIds, hiddenIds }
}
