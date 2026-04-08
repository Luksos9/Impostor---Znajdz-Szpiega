import { useRef, useState } from 'react'
import PrivacyHandoff from '../PrivacyHandoff'
import CardReveal from '../CardReveal'
import PhaseIntro from '../PhaseIntro'
import VoteGrid from '../VoteGrid'
import RoundResult from '../RoundResult'
import { colors, fonts, fontSizes, fontWeights, spacing, radii, colorForMode } from '../../styles/theme'
import { pickImpostor } from '../../utils/players'
import { pickContent } from '../../utils/content'
import {
  awardImpostorSurvival,
  awardCorrectVoters,
  awardImpostorWordGuess,
  impostorCaughtByMajority,
  compareWordGuess,
} from '../../utils/scoring'
import { shuffle } from '../../utils/shuffle'
import { L, t } from '../../utils/labels'

const MAX_TURNS = 3
const MODE_ID = 'classic'

// Klasyczny impostor: the hero mode.
// Flow: reveal → describe (N turns, rotation) → decision → vote or guess → result
export default function ModeClassic({ players, roundIndex, isLastRound, onRoundComplete }) {
  // Refs keep impostor identity and the secret out of React DevTools state.
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
  const speakerOrder = orderRef.current

  const [phase, setPhase] = useState('reveal-handoff')
  const [revealIdx, setRevealIdx] = useState(0)
  const [speakerIdx, setSpeakerIdx] = useState(0)
  const [turn, setTurn] = useState(1)
  const [voteIdx, setVoteIdx] = useState(0)
  const [votes, setVotes] = useState({})
  const [guessText, setGuessText] = useState('')

  const accent = colorForMode(MODE_ID)
  const currentRevealPlayer = players.find((p) => p.id === speakerOrder[revealIdx])
  const currentSpeaker = players.find((p) => p.id === speakerOrder[speakerIdx])
  const currentVoter = players.find((p) => p.id === speakerOrder[voteIdx])

  // Reveal loop
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
    return (
      <CardReveal
        role={isImp ? 'impostor' : 'civilian'}
        label={L.card.yourWord}
        secret={isImp ? L.card.youAreImpostor : content.word}
        hint={isImp ? L.card.youAreImpostorHint : `${L.card.category}: ${content.category}`}
        accent={accent}
        onHide={() => {
          const nextIdx = revealIdx + 1
          if (nextIdx >= players.length) {
            setPhase('describe-intro')
          } else {
            setRevealIdx(nextIdx)
            setPhase('reveal-handoff')
          }
        }}
      />
    )
  }

  // Bridge screen: explain the describe phase before it starts.
  if (phase === 'describe-intro') {
    const firstSpeaker = players.find((p) => p.id === speakerOrder[0])
    return (
      <PhaseIntro
        eyebrow={L.phaseIntro.revealDoneTitle}
        title={L.classic.describeIntroTitle}
        description={t(L.classic.describeIntroDesc, { name: firstSpeaker.name })}
        buttonText={L.classic.describeIntroCta}
        accent={accent}
        onContinue={() => setPhase('describe')}
      />
    )
  }

  // Describe phase: rotate through players, display-size speaker name.
  if (phase === 'describe') {
    return (
      <div
        style={{
          minHeight: 'calc(100vh - 96px)',
          background: colors.bg,
          color: colors.textPrimary,
          fontFamily: fonts.sans,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.lg,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: fontSizes.eyebrow,
            fontWeight: fontWeights.bold,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: colors.textMuted,
            marginBottom: spacing.md,
          }}
        >
          {t(L.classic.turn, { n: turn, total: MAX_TURNS })}
        </div>

        <div
          style={{
            fontSize: fontSizes.bodyLg,
            color: colors.textSecondary,
            marginBottom: spacing.md,
          }}
        >
          {L.classic.nowSpeaking}
        </div>

        <h1
          style={{
            fontSize: fontSizes.display,
            fontWeight: fontWeights.black,
            margin: 0,
            marginBottom: spacing.lg,
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
          }}
        >
          {currentSpeaker.name}
        </h1>

        <p
          style={{
            fontSize: fontSizes.bodyLg,
            color: colors.textSecondary,
            margin: 0,
            marginBottom: spacing.xxl,
            maxWidth: 320,
            lineHeight: 1.4,
          }}
        >
          {L.classic.describeHint}
        </p>

        <button
          onClick={() => {
            const nextSpeakerIdx = speakerIdx + 1
            if (nextSpeakerIdx >= players.length) {
              setPhase('decision')
            } else {
              setSpeakerIdx(nextSpeakerIdx)
            }
          }}
          style={{
            background: accent,
            border: 'none',
            borderRadius: radii.xl,
            color: colors.bg,
            fontSize: fontSizes.h3,
            fontWeight: fontWeights.black,
            paddingTop: spacing.lg,
            paddingBottom: spacing.lg,
            paddingLeft: spacing.xxl,
            paddingRight: spacing.xxl,
            cursor: 'pointer',
            minWidth: 240,
          }}
        >
          {speakerIdx === players.length - 1 ? 'Koniec tury' : L.classic.nextPlayer}
        </button>
      </div>
    )
  }

  // Decision screen between turns: vote, continue, or impostor guesses.
  if (phase === 'decision') {
    return (
      <div
        style={{
          minHeight: 'calc(100vh - 96px)',
          background: colors.bg,
          color: colors.textPrimary,
          fontFamily: fonts.sans,
          display: 'flex',
          flexDirection: 'column',
          paddingTop: spacing.xl,
          paddingBottom: spacing.lg,
          paddingLeft: spacing.lg,
          paddingRight: spacing.lg,
        }}
      >
        <div
          style={{
            fontSize: fontSizes.eyebrow,
            fontWeight: fontWeights.bold,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: colors.textMuted,
            marginBottom: spacing.sm,
          }}
        >
          {t(L.classic.turn, { n: turn, total: MAX_TURNS })}
        </div>

        <h2
          style={{
            fontSize: fontSizes.h2,
            fontWeight: fontWeights.black,
            margin: 0,
            marginBottom: spacing.xs,
            letterSpacing: '-0.01em',
          }}
        >
          {L.classic.whatNext}
        </h2>

        <p
          style={{
            fontSize: fontSizes.body,
            color: colors.textSecondary,
            margin: 0,
            marginBottom: spacing.xl,
          }}
        >
          {L.classic.whatNextHint}
        </p>

        <button
          onClick={() => {
            setVoteIdx(0)
            setVotes({})
            setPhase('vote-handoff')
          }}
          style={{
            background: accent,
            border: 'none',
            borderRadius: radii.xl,
            color: colors.bg,
            fontSize: fontSizes.h3,
            fontWeight: fontWeights.black,
            paddingTop: spacing.md,
            paddingBottom: spacing.md,
            paddingLeft: spacing.md,
            paddingRight: spacing.md,
            cursor: 'pointer',
            marginBottom: spacing.md,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <span>{L.classic.callVote}</span>
          <span
            style={{
              fontSize: fontSizes.bodySm,
              fontWeight: fontWeights.semibold,
              opacity: 0.7,
            }}
          >
            {L.classic.callVoteHint}
          </span>
        </button>

        {turn < MAX_TURNS && (
          <button
            onClick={() => {
              setTurn(turn + 1)
              setSpeakerIdx(0)
              setPhase('describe')
            }}
            style={{
              background: colors.surface,
              border: `1px solid ${colors.borderStrong}`,
              borderRadius: radii.xl,
              color: colors.textPrimary,
              fontSize: fontSizes.body,
              fontWeight: fontWeights.bold,
              paddingTop: spacing.md,
              paddingBottom: spacing.md,
              paddingLeft: spacing.md,
              paddingRight: spacing.md,
              cursor: 'pointer',
              marginBottom: spacing.md,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <span>{L.classic.nextTurn}</span>
            <span
              style={{
                fontSize: fontSizes.bodySm,
                fontWeight: fontWeights.regular,
                color: colors.textMuted,
              }}
            >
              {L.classic.nextTurnHint}
            </span>
          </button>
        )}

        <div style={{ flex: 1 }} />

        <button
          onClick={() => setPhase('guess-handoff')}
          style={{
            background: 'transparent',
            border: `1px dashed ${colors.border}`,
            borderRadius: radii.lg,
            color: colors.textMuted,
            fontSize: fontSizes.bodySm,
            fontWeight: fontWeights.semibold,
            padding: `${spacing.sm}px 0`,
            cursor: 'pointer',
          }}
        >
          {L.classic.iAmImpostor}
        </button>
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
        onVote={(targetId) => {
          const nextVotes = { ...votes, [currentVoter.id]: targetId }
          setVotes(nextVotes)
          const nextIdx = voteIdx + 1
          if (nextIdx >= players.length) {
            setPhase('vote-result')
          } else {
            setVoteIdx(nextIdx)
            setPhase('vote-handoff')
          }
        }}
      />
    )
  }

  // Impostor guess handoff → guess form.
  if (phase === 'guess-handoff') {
    const impostor = players.find((p) => impostorIds.includes(p.id))
    return (
      <PrivacyHandoff
        playerName={impostor.name}
        onReady={() => setPhase('guess-entry')}
      />
    )
  }

  if (phase === 'guess-entry') {
    return (
      <div
        style={{
          minHeight: 'calc(100vh - 96px)',
          background: colors.bg,
          color: colors.textPrimary,
          fontFamily: fonts.sans,
          display: 'flex',
          flexDirection: 'column',
          paddingTop: spacing.xl,
          paddingBottom: spacing.lg,
          paddingLeft: spacing.lg,
          paddingRight: spacing.lg,
        }}
      >
        <div
          style={{
            fontSize: fontSizes.eyebrow,
            fontWeight: fontWeights.bold,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: accent,
            marginBottom: spacing.sm,
          }}
        >
          Impostor
        </div>
        <h2
          style={{
            fontSize: fontSizes.h2,
            fontWeight: fontWeights.black,
            margin: 0,
            marginBottom: spacing.lg,
            letterSpacing: '-0.01em',
          }}
        >
          Zgaduję słowo
        </h2>

        <input
          type="text"
          value={guessText}
          onChange={(e) => setGuessText(e.target.value)}
          placeholder={L.classic.guessPlaceholder}
          autoFocus
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.lg,
            color: colors.textPrimary,
            fontFamily: fonts.sans,
            fontSize: fontSizes.h3,
            fontWeight: fontWeights.bold,
            padding: spacing.md,
            marginBottom: spacing.xl,
            outline: 'none',
            textAlign: 'center',
          }}
        />

        <div style={{ flex: 1 }} />

        <button
          onClick={() => setPhase('result')}
          disabled={!guessText.trim()}
          style={{
            background: guessText.trim() ? accent : colors.surface,
            border: `2px solid ${guessText.trim() ? accent : colors.border}`,
            borderRadius: radii.xl,
            color: guessText.trim() ? colors.bg : colors.textDim,
            fontSize: fontSizes.h3,
            fontWeight: fontWeights.black,
            padding: `${spacing.lg}px 0`,
            cursor: guessText.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          {L.classic.submitGuess}
        </button>
      </div>
    )
  }

  // Vote result: apply scoring based on votes or guess.
  if (phase === 'vote-result') {
    const caught = impostorCaughtByMajority(votes, impostorIds)
    let deltas = Object.fromEntries(players.map((p) => [p.id, 0]))
    let narrative
    if (caught) {
      deltas = awardCorrectVoters(deltas, votes, impostorIds, 1)
      narrative = L.result.impostorCaught
    } else {
      deltas = awardImpostorSurvival(deltas, impostorIds, 2)
      narrative = L.result.impostorEscaped
    }
    return (
      <RoundResult
        impostorIds={impostorIds}
        players={players}
        deltas={deltas}
        narrative={`${narrative} · Słowo: ${content.word}`}
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

  if (phase === 'result') {
    // Impostor guess result.
    const correct = compareWordGuess(guessText, content.word)
    let deltas = Object.fromEntries(players.map((p) => [p.id, 0]))
    let narrative
    if (correct) {
      deltas = awardImpostorWordGuess(deltas, impostorIds, 3)
      narrative = `${L.result.wordGuessCorrect} · ${content.word}`
    } else {
      deltas = awardCorrectVoters(deltas, Object.fromEntries(players.filter((p) => !impostorIds.includes(p.id)).map((p) => [p.id, impostorIds[0]])), impostorIds, 1)
      narrative = `${L.result.wordGuessWrong} · ${content.word}`
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
