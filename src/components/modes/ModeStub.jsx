import { useRef, useState } from 'react'
import PrivacyHandoff from '../PrivacyHandoff'
import CardReveal from '../CardReveal'
import PrivateInput from '../PrivateInput'
import VoteGrid from '../VoteGrid'
import RoundResult from '../RoundResult'
import { colorForMode } from '../../styles/theme'
import { pickImpostor } from '../../utils/players'
import {
  awardImpostorSurvival,
  awardCorrectVoters,
  impostorCaughtByMajority,
} from '../../utils/scoring'
import { L } from '../../utils/labels'

// M2 stub mode. Walks the user through every shared component in order:
//   handoff → reveal → handoff → reveal → ... → input round → vote round → result.
// The goal is to confirm the two-tap hide, peek copy, private text entry,
// per-voter privacy, vote gating, and result screen all work.
//
// Replaced by ModeClassic / ModeKameleon / ModePairsQuestion in later milestones.
//
// Props match the standard mode contract.
export default function ModeStub({ players, roundIndex, isLastRound, onRoundComplete }) {
  // Impostor id is held in a ref to keep it out of React DevTools state.
  const impostorRef = useRef(null)
  if (impostorRef.current === null) {
    impostorRef.current = pickImpostor(players).id
  }
  const impostorIds = [impostorRef.current]

  const [phase, setPhase] = useState('reveal-handoff')
  const [revealIdx, setRevealIdx] = useState(0)
  const [inputIdx, setInputIdx] = useState(0)
  const [voteIdx, setVoteIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [votes, setVotes] = useState({})

  const currentReveal = players[revealIdx]
  const currentInput = players[inputIdx]
  const currentVoter = players[voteIdx]
  const accent = colorForMode('classic')

  // Handoff → reveal cycle for each player.
  if (phase === 'reveal-handoff') {
    return (
      <PrivacyHandoff
        playerName={currentReveal.name}
        onReady={() => setPhase('reveal-card')}
      />
    )
  }

  if (phase === 'reveal-card') {
    const isImp = impostorIds.includes(currentReveal.id)
    return (
      <CardReveal
        role={isImp ? 'impostor' : 'civilian'}
        label={L.card.yourWord}
        secret={isImp ? L.card.youAreImpostor : 'TEST'}
        hint={isImp ? L.card.youAreImpostorHint : 'Kategoria: Stub'}
        accent={accent}
        onHide={() => {
          const nextIdx = revealIdx + 1
          if (nextIdx >= players.length) {
            // Everyone has seen their card. Move to private input round.
            setPhase('input-handoff')
          } else {
            setRevealIdx(nextIdx)
            setPhase('reveal-handoff')
          }
        }}
      />
    )
  }

  // Private input round (exercises PrivateInput).
  if (phase === 'input-handoff') {
    return (
      <PrivacyHandoff
        playerName={currentInput.name}
        onReady={() => setPhase('input-entry')}
      />
    )
  }

  if (phase === 'input-entry') {
    return (
      <PrivateInput
        playerName={currentInput.name}
        prompt="Jak opisujesz tajne słowo w jednym słowie?"
        placeholder="Jedno słowo…"
        modeId="classic"
        maxLength={40}
        onSubmit={(text) => {
          setAnswers((prev) => ({ ...prev, [currentInput.id]: text }))
          const nextIdx = inputIdx + 1
          if (nextIdx >= players.length) {
            setPhase('vote-handoff')
          } else {
            setInputIdx(nextIdx)
            setPhase('input-handoff')
          }
        }}
      />
    )
  }

  // Voting round (exercises VoteGrid with per-voter privacy).
  if (phase === 'vote-handoff') {
    return (
      <PrivacyHandoff
        playerName={currentVoter.name}
        onReady={() => setPhase('vote-entry')}
      />
    )
  }

  if (phase === 'vote-entry') {
    return (
      <VoteGrid
        players={players}
        voterId={currentVoter.id}
        voterName={currentVoter.name}
        onVote={(targetId) => {
          setVotes((prev) => ({ ...prev, [currentVoter.id]: targetId }))
          const nextIdx = voteIdx + 1
          if (nextIdx >= players.length) {
            setPhase('result')
          } else {
            setVoteIdx(nextIdx)
            setPhase('vote-handoff')
          }
        }}
      />
    )
  }

  // Result screen: compute deltas and show reveal.
  if (phase === 'result') {
    const nextVotesMap = votes
    const caught = impostorCaughtByMajority(nextVotesMap, impostorIds)

    let deltas = Object.fromEntries(players.map((p) => [p.id, 0]))
    if (caught) {
      deltas = Object.fromEntries(
        Object.entries(awardCorrectVoters(deltas, nextVotesMap, impostorIds, 1))
      )
    } else {
      deltas = awardImpostorSurvival(deltas, impostorIds, 2)
    }

    const narrative = caught ? L.result.impostorCaught : L.result.impostorEscaped

    return (
      <RoundResult
        impostorIds={impostorIds}
        players={players}
        deltas={deltas}
        narrative={narrative}
        isLastRound={isLastRound}
        onNext={() =>
          onRoundComplete({
            modeId: 'stub',
            impostorIds,
            deltas,
            summary: narrative,
            usedContentId: `stub-round-${roundIndex}`,
            answers,
          })
        }
      />
    )
  }

  return null
}
