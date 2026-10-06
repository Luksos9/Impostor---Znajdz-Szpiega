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

// Quick vote: when the table is sure who all the impostors are, everyone names
// up to `hidden` suspects in ONE pass instead of voting once per impostor.
// `votes` is { voterId: [targetId, ...] }. Every hidden impostor named by more
// than half of the civilians is caught at once; a civilian who reaches a
// majority is only reported. Catching nobody ends the round as usual.
// Points are the same as separate votes: +1 per civilian per caught impostor.
export function resolveQuickVote({ votes, impostorIds, caughtIds = [], civilianCount }) {
  const hidden = impostorIds.filter((id) => !caughtIds.includes(id))
  const needed = votesNeededToCatch(civilianCount)
  const counts = {}
  for (const [voterId, targets] of Object.entries(votes)) {
    if (impostorIds.includes(voterId)) continue
    for (const t of new Set(targets)) counts[t] = (counts[t] || 0) + 1
  }
  const majority = Object.keys(counts).filter((id) => counts[id] >= needed)
  const caught = hidden.filter((id) => majority.includes(id))
  const wrongIds = majority.filter((id) => !impostorIds.includes(id))
  const hitVoterIds = []
  for (const [voterId, targets] of Object.entries(votes)) {
    if (impostorIds.includes(voterId)) continue
    for (const t of new Set(targets)) if (caught.includes(t)) hitVoterIds.push(voterId)
  }
  return {
    quick: true,
    caughtIds: caught,
    caughtId: caught[0] || null,
    wrongIds,
    wrongAccusation: caught.length === 0 && wrongIds.length > 0,
    accusedId: wrongIds[0] || null,
    tie: false,
    needed,
    counts,
    hitVoterIds,
    votes,
  }
}

// A wrong word guess knocks out only the impostor who guessed; partners still
// hidden stay in the game. Every civilian gets +1 for it (see scoreRound).
export function wrongGuessEntry(guesserId, guess) {
  return { wrongGuess: true, guesserId, guess, caughtId: guesserId, caughtIds: [guesserId], hitVoterIds: [] }
}

// Every impostor caught by a log entry (a quick vote can catch several).
export const caughtBy = (v) => v.caughtIds || (v.caughtId ? [v.caughtId] : [])

// Final scoring for the round.
//   voteLog: results of resolveVote, in order
//   reason:  'all-caught' | 'vote-failed' | 'guess-right' | 'guess-wrong'
//   (a wrong guess is a voteLog entry from wrongGuessEntry; 'guess-wrong' just
//   means the last hidden impostor guessed wrong)
export function scoreRound({ players, impostorIds, voteLog, reason }) {
  const deltas = Object.fromEntries(players.map((p) => [p.id, 0]))
  const caughtIds = voteLog.flatMap(caughtBy)
  const hiddenIds = impostorIds.filter((id) => !caughtIds.includes(id))
  const civilianIds = players.map((p) => p.id).filter((id) => !impostorIds.includes(id))

  for (const v of voteLog) for (const id of v.hitVoterIds) deltas[id] += 1
  for (const v of voteLog) if (v.wrongGuess) for (const id of civilianIds) deltas[id] += 1

  if (reason === 'vote-failed') for (const id of hiddenIds) deltas[id] += 2
  if (reason === 'guess-right') for (const id of hiddenIds) deltas[id] += 3

  const impostorsScored = reason === 'vote-failed' || reason === 'guess-right'
  const winner = !impostorsScored ? 'civilians' : caughtIds.length > 0 ? 'mixed' : 'impostors'
  return { deltas, winner, caughtIds, hiddenIds }
}
