import { useRef, useState } from 'react'
import PrivacyHandoff from '../PrivacyHandoff'
import CardReveal from '../CardReveal'
import PhaseIntro from '../PhaseIntro'
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
  radii,
  shadows,
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
} from '../../utils/scoring'
import { shuffle } from '../../utils/shuffle'
import { L, t } from '../../utils/labels'

const MAX_TURNS = 2
const MODE_ID = 'kameleon'

// Kameleon: Chameleon-style grid mode.
// Flow: public grid → secret reveal (private) → describe turns → decision → vote or grid guess → result
export default function ModeKameleon({ players, roundIndex, isLastRound, onRoundComplete }) {
  const impostorRef = useRef(null)
  const contentRef = useRef(null)
  const secretRef = useRef(null)
  const orderRef = useRef(null)

  if (impostorRef.current === null) {
    impostorRef.current = pickImpostor(players).id
  }
  if (contentRef.current === null) {
    const picked = pickContent(MODE_ID, [])
    contentRef.current = picked.item
    // Pick a random word from the grid as the secret.
    const words = picked.item?.words || []
    secretRef.current = words[Math.floor(Math.random() * words.length)]
  }
  if (orderRef.current === null) {
    orderRef.current = shuffle(players).map((p) => p.id)
  }

  const impostorIds = [impostorRef.current]
  const content = contentRef.current
  const secret = secretRef.current
  const order = orderRef.current
  const accent = colorForMode(MODE_ID)
  const accentShadow = colorForModeShadow(MODE_ID)

  const [phase, setPhase] = useState('grid-intro')
  const [revealIdx, setRevealIdx] = useState(0)
  const [speakerIdx, setSpeakerIdx] = useState(0)
  const [turn, setTurn] = useState(1)
  const [voteIdx, setVoteIdx] = useState(0)
  const [votes, setVotes] = useState({})
  const [guessedWord, setGuessedWord] = useState(null)

  const currentRevealPlayer = players.find((p) => p.id === order[revealIdx])
  const currentSpeaker = players.find((p) => p.id === order[speakerIdx])
  const currentVoter = players.find((p) => p.id === order[voteIdx])

  // Hardcoded font size 13 stays — Polish words like "Rowerzysta" wrap badly at larger sizes.
  const gridCellStyle = {
    background: colors.surface,
    border: `1.5px solid ${colors.border}`,
    borderRadius: radii.md,
    boxShadow: shadows.soft,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.xs,
    paddingRight: spacing.xs,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: fontWeights.extraBold,
    color: colors.textPrimary,
    minHeight: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    wordBreak: 'break-word',
    lineHeight: 1.15,
    overflow: 'hidden',
    fontFamily: fonts.sans,
  }

  // Grid intro: public screen showing the 4x4 word grid plus the topic banner.
  // Everyone sees this before the private secret reveal.
  if (phase === 'grid-intro') {
    return (
      <div
        className="anim-enter"
        style={{
          flex: 1,
          minHeight: 0,
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
          {L.kameleon.topic}
        </div>

        <Card
          elevation="medium"
          padded="lg"
          accent={accent}
          style={{ marginBottom: spacing.md }}
        >
          <h2
            style={{
              fontSize: fontSizes.h1,
              fontWeight: fontWeights.black,
              margin: 0,
              letterSpacing: '-0.02em',
              color: colors.textPrimary,
              lineHeight: 1.05,
            }}
          >
            {content.topic}
          </h2>
        </Card>

        <p
          style={{
            fontSize: fontSizes.body,
            color: colors.textSecondary,
            margin: 0,
            marginBottom: spacing.lg,
            lineHeight: 1.4,
            fontWeight: fontWeights.semibold,
          }}
        >
          Ta siatka jest publiczna. Jedno z tych słów jest tajne. Kameleon go nie zna.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: spacing.sm,
            marginBottom: spacing.xl,
          }}
        >
          {content.words.map((w, idx) => (
            <div key={idx} style={gridCellStyle}>
              {w}
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <Button
          variant="primary"
          size="hero"
          accentColor={accent}
          shadowColor={accentShadow}
          fullWidth
          onClick={() => setPhase('reveal-handoff')}
        >
          Wszyscy widzą siatkę
        </Button>
      </div>
    )
  }

  // Reveal loop: civilian sees the secret word, chameleon sees the impostor card.
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
        label={L.card.yourSecretWord}
        secret={isImp ? L.card.youAreChameleon : secret}
        hint={isImp ? L.card.youAreChameleonHint : `Temat: ${content.topic}`}
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

  // Bridge: explain the describe phase.
  if (phase === 'describe-intro') {
    const firstSpeaker = players.find((p) => p.id === order[0])
    return (
      <PhaseIntro
        eyebrow={L.phaseIntro.revealDoneTitle}
        title={L.classic.describeIntroTitle}
        description={t(L.phaseIntro.kameleonDescribeDesc, { name: firstSpeaker.name })}
        buttonText={L.classic.describeIntroCta}
        accent={accent}
        shadowColor={accentShadow}
        onContinue={() => setPhase('describe')}
      />
    )
  }

  // Describe phase: rotate through players like Classic, but 2 turns instead of 3.
  if (phase === 'describe') {
    return (
      <div
        className="anim-enter"
        style={{
          flex: 1,
          minHeight: 0,
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
          Powiedz JEDNO słowo pasujące do tajnego słowa
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

  // Decision: vote, next turn, or chameleon guesses from the grid.
  if (phase === 'decision') {
    return (
      <div
        className="anim-enter"
        style={{
          flex: 1,
          minHeight: 0,
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
          onClick={() => setPhase('guess-grid')}
        >
          {L.kameleon.iAmChameleon}
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

  // Chameleon picks a word from the public grid. Cells are pressable buttons here.
  if (phase === 'guess-grid') {
    const guessCellClassName = 'kameleon-guess-cell'
    const guessCellCss = `
      .${guessCellClassName} {
        background: ${colors.surface};
        border: 2px solid ${colors.borderStrong};
        border-radius: ${radii.md}px;
        box-shadow: ${shadows.tactile};
        padding: ${spacing.sm}px ${spacing.xs}px;
        text-align: center;
        font-size: 13px;
        font-weight: ${fontWeights.black};
        color: ${colors.textPrimary};
        font-family: ${fonts.sans};
        min-height: 64px;
        display: flex;
        align-items: center;
        justify-content: center;
        word-break: break-word;
        line-height: 1.15;
        overflow: hidden;
        cursor: pointer;
        transform: translateY(0);
        transition: transform 90ms ease, box-shadow 90ms ease, border-color 120ms ease;
      }
      .${guessCellClassName}:hover:not(:disabled) {
        border-color: ${accent};
      }
      .${guessCellClassName}:active:not(:disabled) {
        transform: translateY(4px);
        box-shadow: 0 0 0 transparent;
      }
      .${guessCellClassName}:focus-visible {
        outline: none;
        border-color: ${accent};
        box-shadow: ${shadows.tactile}, 0 0 0 3px ${accent}33;
      }
    `
    return (
      <div
        className="anim-enter"
        style={{
          flex: 1,
          minHeight: 0,
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
        <style>{guessCellCss}</style>

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
          Kameleon
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
          {L.kameleon.tapToGuess}
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: spacing.sm,
            marginBottom: spacing.xl,
          }}
        >
          {content.words.map((w, idx) => (
            <button
              key={idx}
              type="button"
              className={guessCellClassName}
              onClick={() => {
                setGuessedWord(w)
                setPhase('result')
              }}
            >
              {w}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Vote result: did majority catch the chameleon?
  if (phase === 'vote-result') {
    const caught = impostorCaughtByMajority(votes, impostorIds)
    let deltas = Object.fromEntries(players.map((p) => [p.id, 0]))
    let narrative
    if (caught) {
      deltas = awardCorrectVoters(deltas, votes, impostorIds, 1)
      narrative = `${L.result.chameleonCaught} · Tajne słowo: ${secret}`
    } else {
      deltas = awardImpostorSurvival(deltas, impostorIds, 2)
      narrative = `${L.result.chameleonEscaped} · Tajne słowo: ${secret}`
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

  // Grid-tap guess result.
  if (phase === 'result') {
    const correct = guessedWord === secret
    let deltas = Object.fromEntries(players.map((p) => [p.id, 0]))
    let narrative
    if (correct) {
      deltas = awardImpostorWordGuess(deltas, impostorIds, 3)
      narrative = `${L.result.wordGuessCorrect} · Tajne słowo: ${secret}`
    } else {
      // Wrong guess. Non-impostors each get +1 (chameleon outed themselves).
      const nonImpostors = players.filter((p) => !impostorIds.includes(p.id))
      const fakeVotes = Object.fromEntries(nonImpostors.map((p) => [p.id, impostorIds[0]]))
      deltas = awardCorrectVoters(deltas, fakeVotes, impostorIds, 1)
      narrative = `${L.result.wordGuessWrong} · Tajne słowo: ${secret} (strzał: ${guessedWord})`
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
