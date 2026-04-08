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

  // Grid intro: public screen showing the 4x4 word grid plus the topic banner.
  // Everyone sees this before the private secret reveal.
  if (phase === 'grid-intro') {
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
          {L.kameleon.topic}
        </div>
        <h2
          style={{
            fontSize: fontSizes.h2,
            fontWeight: fontWeights.black,
            margin: 0,
            marginBottom: spacing.sm,
            letterSpacing: '-0.01em',
          }}
        >
          {content.topic}
        </h2>
        <p
          style={{
            fontSize: fontSizes.body,
            color: colors.textSecondary,
            margin: 0,
            marginBottom: spacing.lg,
            lineHeight: 1.4,
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
            <div
              key={idx}
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: radii.md,
                paddingTop: spacing.sm,
                paddingBottom: spacing.sm,
                paddingLeft: spacing.xs,
                paddingRight: spacing.xs,
                textAlign: 'center',
                fontSize: 13,
                fontWeight: fontWeights.bold,
                minHeight: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                wordBreak: 'break-word',
                lineHeight: 1.15,
                overflow: 'hidden',
              }}
            >
              {w}
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <button
          onClick={() => setPhase('reveal-handoff')}
          style={{
            background: accent,
            border: 'none',
            borderRadius: radii.xl,
            color: colors.bg,
            fontSize: fontSizes.h3,
            fontWeight: fontWeights.black,
            padding: `${spacing.lg}px 0`,
            cursor: 'pointer',
          }}
        >
          Wszyscy widzą siatkę
        </button>
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
        onContinue={() => setPhase('describe')}
      />
    )
  }

  // Describe phase: rotate through players like Classic, but 2 turns instead of 3.
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
          Powiedz JEDNO słowo pasujące do tajnego słowa
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

  // Decision: vote, next turn, or chameleon guesses from the grid.
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
          onClick={() => setPhase('guess-grid')}
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
          {L.kameleon.iAmChameleon}
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

  // Chameleon picks a word from the public grid.
  if (phase === 'guess-grid') {
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
          Kameleon
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
              onClick={() => {
                setGuessedWord(w)
                setPhase('result')
              }}
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: radii.md,
                paddingTop: spacing.sm,
                paddingBottom: spacing.sm,
                paddingLeft: spacing.xs,
                paddingRight: spacing.xs,
                textAlign: 'center',
                fontSize: 13,
                fontWeight: fontWeights.bold,
                color: colors.textPrimary,
                minHeight: 64,
                cursor: 'pointer',
                wordBreak: 'break-word',
                lineHeight: 1.15,
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
