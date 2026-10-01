// Shared vote-round summary for every mode: who got caught, the points, and the
// plain-language facts + per-voter rows the result screen shows. Pure function.

import {
  awardCorrectVoters,
  awardImpostorSurvival,
  impostorCaughtByMajority,
  tallyCivilianVotes,
  votesNeededToCatch,
} from './scoring'

// `role` swaps the wording for Kameleon ("kameleon") vs the others ("impostor").
export function buildVoteSummary({ players, votes, impostorIds, role = 'impostor' }) {
  const caught = impostorCaughtByMajority(votes, impostorIds)
  const plural = impostorIds.length > 1
  const nameOf = (id) => players.find((p) => p.id === id)?.name || ''

  let deltas = Object.fromEntries(players.map((p) => [p.id, 0]))
  deltas = caught
    ? awardCorrectVoters(deltas, votes, impostorIds, 1)
    : awardImpostorSurvival(deltas, impostorIds, 2)

  const civilianCount = players.length - impostorIds.length
  const hits = Object.keys(votes).filter(
    (id) => !impostorIds.includes(id) && impostorIds.includes(votes[id])
  ).length
  const { counts, accused, topCount, tie } = tallyCivilianVotes(votes, impostorIds)

  const target = role === 'kameleon' ? 'Kameleona' : plural ? 'Impostorów' : 'Impostora'
  const survivor =
    role === 'kameleon' ? 'Kameleon dostaje' : plural ? 'Impostorzy dostają' : 'Impostor dostaje'

  const facts = [
    `${target} wskazało ${hits} z ${civilianCount} cywili (do złapania trzeba było ${votesNeededToCatch(civilianCount)})`,
    tie
      ? 'Głosy cywili rozłożyły się po równo'
      : accused
        ? `Najwięcej głosów cywili: ${nameOf(accused)} (${topCount})`
        : null,
    caught ? 'Cywile dostają po +1 pkt za trafny głos' : `${survivor} +2 pkt za przetrwanie`,
  ].filter(Boolean)

  const voteRows = players.map((voter) => ({
    voter: voter.name,
    target: nameOf(votes[voter.id]),
    hit: impostorIds.includes(votes[voter.id]) && !impostorIds.includes(voter.id),
    votesReceived: counts[voter.id] || 0,
  }))

  return { caught, deltas, facts, voteRows, impostorNames: impostorIds.map(nameOf) }
}
