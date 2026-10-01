import { useEffect, useId, useRef, useState } from 'react'
import { hapticHeavy } from '../../utils/haptics'
import PrivacyHandoff from '../PrivacyHandoff'
import GuessConfirm from '../GuessConfirm'
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
import { pickImpostors, makeSpeakerOrder } from '../../utils/players'
import { pickContent } from '../../utils/content'
import {
  awardImpostorWordGuess,
  compareWordGuess,
  awardCivilians,
} from '../../utils/scoring'
import { speak } from '../../utils/voice'
import {
  roundHeadline,
  speakerLine,
  speakerQuip,
  voteStartLine,
  roundIntroLine,
  turnLine,
  decisionLine,
  guessEntryLine,
} from '../../utils/narration'
import { useNudge } from '../../utils/useNudge'
import { buildVoteSummary } from '../../utils/roundSummary'
import { L, t } from '../../utils/labels'

const MAX_TURNS = 3
const MODE_ID = 'classic'

// Klasyczny impostor: the hero mode.
// Flow: reveal → describe (N turns, rotation) → decision → vote or guess → result
export default function ModeClassic({
  players,
  roundIndex,
  isLastRound,
  onRoundComplete,
  impostorCount = 1,
  usedContentIds = [],
}) {
  // Lazy useState initialisers: chosen once per mounted round, never re-rolled.
  const [impostorIds] = useState(() => pickImpostors(players, impostorCount))
  // usedContentIds keeps words from repeating within one game.
  const [content] = useState(() => pickContent(MODE_ID, usedContentIds).item)
  // Impostors only rarely (~5%) get to speak first.
  const [speakerOrder] = useState(() => makeSpeakerOrder(players, impostorIds))

  const [phase, setPhase] = useState('reveal-handoff')
  const [revealIdx, setRevealIdx] = useState(0)
  const [speakerIdx, setSpeakerIdx] = useState(0)
  const [turn, setTurn] = useState(1)
  const [voteIdx, setVoteIdx] = useState(0)
  const [votes, setVotes] = useState({})
  const [guessText, setGuessText] = useState('')
  // Where "Wróć" goes if the table backs out of an impostor guess.
  const guessReturnRef = useRef('decision')

  const reactId = useId()
  const safeId = reactId.replace(/:/g, '')
  const guessInputClass = `guess-input-${safeId}`

  const accent = colorForMode(MODE_ID)
  const accentShadow = colorForModeShadow(MODE_ID)
  const currentRevealPlayer = players.find((p) => p.id === speakerOrder[revealIdx])
  const currentSpeaker = players.find((p) => p.id === speakerOrder[speakerIdx])
  const currentVoter = players.find((p) => p.id === speakerOrder[voteIdx])

  // Narrator: announce each speaker, each new turn, the decision and the guess.
  useEffect(() => {
    if (phase === 'describe') {
      const speaker = players.find((p) => p.id === speakerOrder[speakerIdx])
      if (!speaker) return undefined
      const prefix = speakerIdx === 0 && turn > 1 ? `${turnLine(turn)} ` : ''
      return speak(`${prefix}${speakerLine(speaker.name)} ${speakerQuip()}`.trim())
    }
    if (phase === 'decision') return speak(decisionLine())
      if (phase === 'guess-entry') return speak(guessEntryLine())
    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, speakerIdx, turn])

  // Poke slow speakers and slow deciders.
  useNudge(phase === 'describe' || phase === 'decision', { after: 20000, every: 15000 })

  // An impostor guess ends the round, so the table confirms it first. The
  // hand-off afterwards is deliberately anonymous: naming the impostor on a
  // screen everyone can see would give them away.
  const startGuess = () => {
    guessReturnRef.current = phase === 'describe' ? 'describe' : 'decision'
    setPhase('guess-confirm')
  }
  const backFromGuess = () => setPhase(guessReturnRef.current)

  // Reveal loop
  if (phase === 'reveal-handoff') {
    return (
      <PrivacyHandoff
        playerName={currentRevealPlayer.name}
        intro={revealIdx === 0 ? roundIntroLine(roundIndex, isLastRound) : undefined}
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
        // Civilians see only the word — a category line just confuses people.
        hint={isImp ? L.card.youAreImpostorHint : undefined}
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
  // Persistent "I'm the impostor" guess button pinned at the bottom —
  // available at any time during describes, matching Spyfall rules.
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
          paddingTop: spacing.lg,
          paddingLeft: spacing.lg,
          paddingRight: spacing.lg,
          paddingBottom: spacing.xl + 8,
        }}
      >
        <div
          key={currentSpeaker.id}
          className="anim-slide-right"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
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

        <Button
          variant="dashed"
          size="sm"
          fullWidth
          onClick={startGuess}
        >
          {L.classic.iAmImpostor}
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
          onClick={startGuess}
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
        intro={voteIdx === 0 ? voteStartLine() : undefined}
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
  if (phase === 'guess-confirm') {
    return (
      <GuessConfirm
        eyebrow="Strzał impostora"
        accent={accent}
        shadowColor={accentShadow}
        onConfirm={() => setPhase('guess-handoff')}
        onBack={backFromGuess}
      />
    )
  }

  if (phase === 'guess-handoff') {
    return <PrivacyHandoff playerName="Impostor" onReady={() => setPhase('guess-entry')} />
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
          onClick={() => {
            hapticHeavy()
            setPhase('result')
          }}
        >
          {L.classic.submitGuess}
        </Button>
        <Button variant="ghost" size="md" fullWidth onClick={backFromGuess}>
          Wróć
        </Button>
      </div>
    )
  }

  // Vote result: apply scoring based on votes.
  if (phase === 'vote-result') {
    const { caught, deltas, facts, voteRows, impostorNames } = buildVoteSummary({
      players,
      votes,
      impostorIds,
    })
    const headline = roundHeadline(caught ? 'caught' : 'escaped', {
      impostorNames,
      plural: impostorIds.length > 1,
    })

    return (
      <RoundResult
        impostorIds={impostorIds}
        players={players}
        deltas={deltas}
        winner={caught ? 'civilians' : 'impostors'}
        headline={headline}
        speech={`${headline} Tajne słowo: ${content.word}.`}
        secret={{ label: 'Tajne słowo', value: content.word }}
        facts={facts}
        voteRows={voteRows}
        isLastRound={isLastRound}
        onNext={() =>
          onRoundComplete({
            modeId: MODE_ID,
            impostorIds,
            deltas,
            summary: headline,
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
    if (correct) {
      deltas = awardImpostorWordGuess(deltas, impostorIds, 3)
    } else {
      deltas = awardCivilians(deltas, players.map((p) => p.id), impostorIds, 1)
    }
    const headline = roundHeadline(correct ? 'guessRight' : 'guessWrong', {
      word: content.word,
      plural: impostorIds.length > 1,
    })
    const facts = [
      `Impostor zgaduje: „${guessText.trim()}”`,
      correct
        ? `Impostor${impostorIds.length > 1 ? 'zy dostają' : ' dostaje'} +3 pkt za trafione słowo`
        : 'Cywile dostają po +1 pkt za zdemaskowanie',
    ]

    return (
      <RoundResult
        impostorIds={impostorIds}
        players={players}
        deltas={deltas}
        winner={correct ? 'impostors' : 'civilians'}
        headline={headline}
        speech={headline}
        secret={{ label: 'Tajne słowo', value: content.word }}
        facts={facts}
        isLastRound={isLastRound}
        onNext={() =>
          onRoundComplete({
            modeId: MODE_ID,
            impostorIds,
            deltas,
            summary: headline,
            usedContentId: content.id,
          })
        }
      />
    )
  }

  return null
}
