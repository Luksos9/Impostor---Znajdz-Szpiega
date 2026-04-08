import { useId, useRef, useState } from 'react'
import PrivacyHandoff from '../PrivacyHandoff'
import CardReveal from '../CardReveal'
import PhaseIntro from '../PhaseIntro'
import VoteGrid from '../VoteGrid'
import RoundResult from '../RoundResult'
import Button from '../ui/Button'
import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  spacing,
  radii,
  colorForMode,
  colorForModeShadow,
} from '../../styles/theme'
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

  const reactId = useId()
  const safeId = reactId.replace(/:/g, '')
  const guessInputClass = `guess-input-${safeId}`

  const accent = colorForMode(MODE_ID)
  const accentShadow = colorForModeShadow(MODE_ID)
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
        shadowColor={accentShadow}
        onContinue={() => setPhase('describe')}
      />
    )
  }

  // Describe phase: rotate through players, display-size speaker name.
  if (phase === 'describe') {
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
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: spacing.lg,
          paddingLeft: spacing.lg,
          paddingRight: spacing.lg,
          paddingBottom: spacing.xl + 8,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: fontSizes.eyebrow,
            fontWeight: fontWeights.extraBold,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: accent,
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
            fontWeight: fontWeights.semibold,
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
            color: colors.textPrimary,
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
            fontWeight: fontWeights.semibold,
          }}
        >
          {L.classic.describeHint}
        </p>

        <Button
          variant="primary"
          size="lg"
          accentColor={accent}
          shadowColor={accentShadow}
          onClick={() => {
            const nextSpeakerIdx = speakerIdx + 1
            if (nextSpeakerIdx >= players.length) {
              setPhase('decision')
            } else {
              setSpeakerIdx(nextSpeakerIdx)
            }
          }}
          style={{ minWidth: 240 }}
        >
          {speakerIdx === players.length - 1 ? 'Koniec tury' : L.classic.nextPlayer}
        </Button>
      </div>
    )
  }

  // Decision screen between turns: vote, continue, or impostor guesses.
  if (phase === 'decision') {
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
          {t(L.classic.turn, { n: turn, total: MAX_TURNS })}
        </div>

        <h2
          style={{
            fontSize: fontSizes.h1,
            fontWeight: fontWeights.black,
            margin: 0,
            marginBottom: spacing.xs,
            letterSpacing: '-0.02em',
            color: colors.textPrimary,
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
            fontWeight: fontWeights.semibold,
          }}
        >
          {L.classic.whatNextHint}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          <Button
            variant="primary"
            size="lg"
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

          {turn < MAX_TURNS && (
            <Button
              variant="secondary"
              size="lg"
              accentColor={accent}
              fullWidth
              onClick={() => {
                setTurn(turn + 1)
                setSpeakerIdx(0)
                setPhase('describe')
              }}
            >
              {L.classic.nextTurn}
            </Button>
          )}
        </div>

        <div style={{ flex: 1 }} />

        <Button
          variant="dashed"
          size="md"
          fullWidth
          onClick={() => setPhase('guess-handoff')}
        >
          {L.classic.iAmImpostor}
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
    const guessCss = `
      .${guessInputClass} {
        background: ${colors.surface};
        border: 2px solid ${colors.borderStrong};
        border-radius: ${radii.lg}px;
        color: ${colors.textPrimary};
        font-family: ${fonts.sans};
        font-size: ${fontSizes.h2}px;
        font-weight: ${fontWeights.black};
        padding: ${spacing.md}px;
        text-align: center;
        outline: none;
        width: 100%;
        transition: border-color 120ms ease, box-shadow 120ms ease;
        letterSpacing: -0.01em;
      }
      .${guessInputClass}:focus {
        border-color: ${accent};
        box-shadow: 0 0 0 3px ${accent}22;
      }
      .${guessInputClass}::placeholder {
        color: ${colors.textMuted};
        font-weight: ${fontWeights.bold};
      }
    `
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
        <style>{guessCss}</style>

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
          Impostor
        </div>
        <h2
          style={{
            fontSize: fontSizes.h1,
            fontWeight: fontWeights.black,
            margin: 0,
            marginBottom: spacing.lg,
            letterSpacing: '-0.02em',
            color: colors.textPrimary,
          }}
        >
          Zgaduję słowo
        </h2>

        <input
          type="text"
          className={guessInputClass}
          value={guessText}
          onChange={(e) => setGuessText(e.target.value)}
          placeholder={L.classic.guessPlaceholder}
          autoFocus
          style={{ marginBottom: spacing.xl }}
        />

        <div style={{ flex: 1 }} />

        <Button
          variant="primary"
          size="hero"
          accentColor={accent}
          shadowColor={accentShadow}
          fullWidth
          disabled={!guessText.trim()}
          onClick={() => setPhase('result')}
        >
          {L.classic.submitGuess}
        </Button>
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
      deltas = awardCorrectVoters(
        deltas,
        Object.fromEntries(
          players
            .filter((p) => !impostorIds.includes(p.id))
            .map((p) => [p.id, impostorIds[0]])
        ),
        impostorIds,
        1
      )
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
