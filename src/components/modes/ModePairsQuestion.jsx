import { useRef, useState } from 'react'
import PrivacyHandoff from '../PrivacyHandoff'
import CardReveal from '../CardReveal'
import PhaseIntro from '../PhaseIntro'
import PrivateInput from '../PrivateInput'
import VoteGrid from '../VoteGrid'
import RoundResult from '../RoundResult'
import Button from '../ui/Button'
import Card from '../ui/Card'
import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  spacing,
  colorForMode,
  colorForModeShadow,
} from '../../styles/theme'
import { pickImpostor } from '../../utils/players'
import { pickContent } from '../../utils/content'
import {
  awardImpostorSurvival,
  awardCorrectVoters,
  impostorCaughtByMajority,
} from '../../utils/scoring'
import { shuffle } from '../../utils/shuffle'
import { L } from '../../utils/labels'

const MODE_ID = 'pairsQuestion'

// Kto ma inne pytanie?: write-and-reveal mode.
// Flow: reveal question (private) → write answer (private) → reveal grid (public) → vote → result
export default function ModePairsQuestion({ players, roundIndex, isLastRound, onRoundComplete }) {
  // Refs keep impostor and content out of React DevTools state.
  const impostorRef = useRef(null)
  const contentRef = useRef(null)
  const orderRef = useRef(null)

  if (impostorRef.current === null) {
    impostorRef.current = pickImpostor(players).id
  }
  if (contentRef.current === null) {
    const picked = pickContent(MODE_ID, [])
    contentRef.current = picked.item
  }
  if (orderRef.current === null) {
    orderRef.current = shuffle(players).map((p) => p.id)
  }

  const impostorIds = [impostorRef.current]
  const content = contentRef.current
  const order = orderRef.current

  const [phase, setPhase] = useState('reveal-handoff')
  const [revealIdx, setRevealIdx] = useState(0)
  const [writeIdx, setWriteIdx] = useState(0)
  const [voteIdx, setVoteIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [votes, setVotes] = useState({})

  const accent = colorForMode(MODE_ID)
  const accentShadow = colorForModeShadow(MODE_ID)
  const currentRevealPlayer = players.find((p) => p.id === order[revealIdx])
  const currentWriter = players.find((p) => p.id === order[writeIdx])
  const currentVoter = players.find((p) => p.id === order[voteIdx])

  // Reveal loop: each player sees their question privately.
  if (phase === 'reveal-handoff') {
    return (
      <PrivacyHandoff
        playerName={currentRevealPlayer.name}
        onReady={() => setPhase('reveal-card')}
      />
    )
  }

  if (phase === 'reveal-card') {
    const isImp = impostorIds.includes(currentRevealPlayer.id)
    const question = isImp ? content.impostor : content.common
    return (
      <CardReveal
        role="civilian"
        label={L.card.yourCommonQuestion}
        secret={question}
        hint={null}
        accent={accent}
        onHide={() => {
          const nextIdx = revealIdx + 1
          if (nextIdx >= players.length) {
            setPhase('write-intro')
          } else {
            setRevealIdx(nextIdx)
            setPhase('reveal-handoff')
          }
        }}
      />
    )
  }

  // Bridge: explain the private writing phase.
  if (phase === 'write-intro') {
    return (
      <PhaseIntro
        eyebrow={L.phaseIntro.revealDoneTitle}
        title={L.phaseIntro.writeIntroTitle}
        description={L.phaseIntro.writeIntroDesc}
        buttonText={L.phaseIntro.writeIntroCta}
        accent={accent}
        shadowColor={accentShadow}
        onContinue={() => setPhase('write-handoff')}
      />
    )
  }

  // Answer loop: each player types privately.
  if (phase === 'write-handoff') {
    return (
      <PrivacyHandoff
        playerName={currentWriter.name}
        onReady={() => setPhase('write-entry')}
      />
    )
  }

  if (phase === 'write-entry') {
    return (
      <PrivateInput
        playerName={currentWriter.name}
        prompt={L.pairsQuestion.writeAnswer}
        placeholder={L.pairsQuestion.answerPlaceholder}
        modeId={MODE_ID}
        maxLength={80}
        onSubmit={(text) => {
          setAnswers((prev) => ({ ...prev, [currentWriter.id]: text }))
          const nextIdx = writeIdx + 1
          if (nextIdx >= players.length) {
            setPhase('reveal-grid')
          } else {
            setWriteIdx(nextIdx)
            setPhase('write-handoff')
          }
        }}
      />
    )
  }

  // Public reveal: all answers shown simultaneously with player names.
  // The common question is shown as a banner at the top for table discussion.
  if (phase === 'reveal-grid') {
    return (
      <div
        className="anim-enter"
        style={{
          minHeight: 'calc(100dvh - 96px)',
          background: colors.bg,
          color: colors.textPrimary,
          fontFamily: fonts.sans,
          display: 'flex',
          flexDirection: 'column',
          paddingTop: spacing.xl,
          paddingBottom: spacing.xl + 8,
          paddingLeft: spacing.lg,
          paddingRight: spacing.lg,
        }}
      >
        <div
          style={{
            fontSize: fontSizes.eyebrow,
            fontWeight: fontWeights.extraBold,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: accent,
            marginBottom: spacing.sm,
          }}
        >
          {L.pairsQuestion.commonQuestionLabel}
        </div>

        <Card
          elevation="medium"
          padded="lg"
          accent={accent}
          style={{ marginBottom: spacing.xl }}
        >
          <div
            style={{
              fontSize: fontSizes.h3,
              fontWeight: fontWeights.black,
              lineHeight: 1.25,
              letterSpacing: '-0.01em',
              color: colors.textPrimary,
            }}
          >
            {content.common}
          </div>
        </Card>

        <div
          style={{
            fontSize: fontSizes.eyebrow,
            fontWeight: fontWeights.extraBold,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: colors.textMuted,
            marginBottom: spacing.sm,
          }}
        >
          {L.pairsQuestion.allAnswers}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.sm,
            marginBottom: spacing.xl,
          }}
        >
          {players.map((p, idx) => (
            <Card
              key={p.id}
              elevation="soft"
              padded="md"
              className="anim-pop"
              style={{
                animationDelay: `${idx * 80}ms`,
              }}
            >
              <div
                style={{
                  fontSize: fontSizes.bodySm,
                  color: colors.textMuted,
                  fontWeight: fontWeights.extraBold,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  marginBottom: spacing.xs,
                }}
              >
                {p.name}
              </div>
              <div
                style={{
                  fontSize: fontSizes.bodyLg,
                  fontWeight: fontWeights.extraBold,
                  lineHeight: 1.3,
                  color: colors.textPrimary,
                }}
              >
                {answers[p.id] || '—'}
              </div>
            </Card>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <Button
          variant="primary"
          size="hero"
          accentColor={accent}
          shadowColor={accentShadow}
          fullWidth
          onClick={() => {
            setVoteIdx(0)
            setVotes({})
            setPhase('vote-handoff')
          }}
        >
          {L.classic.callVote}
        </Button>
      </div>
    )
  }

  // Per-voter privacy then VoteGrid.
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
        accent={accent}
        onVote={(targetId) => {
          const nextVotes = { ...votes, [currentVoter.id]: targetId }
          setVotes(nextVotes)
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

  // Result
  if (phase === 'result') {
    const caught = impostorCaughtByMajority(votes, impostorIds)
    let deltas = Object.fromEntries(players.map((p) => [p.id, 0]))
    let narrative
    if (caught) {
      deltas = awardCorrectVoters(deltas, votes, impostorIds, 1)
      narrative = `${L.result.impostorCaught} · Inne pytanie: ${content.impostor}`
    } else {
      deltas = awardImpostorSurvival(deltas, impostorIds, 2)
      narrative = `${L.result.impostorEscaped} · Inne pytanie: ${content.impostor}`
    }
    return (
      <RoundResult
        impostorIds={impostorIds}
        players={players}
        deltas={deltas}
        narrative={narrative}
        isLastRound={isLastRound}
        onNext={() =>
          onRoundComplete({
            modeId: MODE_ID,
            impostorIds,
            deltas,
            summary: narrative,
            usedContentId: content.id,
          })
        }
      />
    )
  }

  return null
}
