import { useState } from 'react'
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
import { pickImpostor, makeSpeakerOrder } from '../../utils/players'
import GuessConfirm from '../GuessConfirm'
import { buildVoteSummary } from '../../utils/roundSummary'
import { roundHeadline } from '../../utils/narration'
import { pickContent } from '../../utils/content'
import {
  awardImpostorWordGuess,
  awardCivilians,
} from '../../utils/scoring'
import { L, t } from '../../utils/labels'

const MAX_TURNS = 2
const MODE_ID = 'kameleon'

// Kameleon: Chameleon-style grid mode.
// Flow: public grid → secret reveal (private) → describe turns → decision → vote or grid guess → result
export default function ModeKameleon({ players, isLastRound, onRoundComplete, usedContentIds = [] }) {
  // Lazy useState initialisers: chosen once per mounted round, never re-rolled.
  const [impostorId] = useState(() => pickImpostor(players).id)
  const [content] = useState(() => pickContent(MODE_ID, usedContentIds).item)
  // The secret is one random word from the public grid.
  const [secret] = useState(() => {
    const words = content?.words || []
    return words[Math.floor(Math.random() * words.length)]
  })
  // An impostor speaks first only ~5% of the time.
  const [order] = useState(() => makeSpeakerOrder(players, [impostorId]))
  const impostorIds = [impostorId]
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
          key={currentSpeaker.id}
          className="anim-slide-right"
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
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
        </div>

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
          onClick={() => setPhase('guess-confirm')}
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
  // A grid guess ends the round and any civilian who knows the secret could
  // tap the right cell — so: confirm first, then an anonymous hand-off.
  if (phase === 'guess-confirm') {
    return (
      <GuessConfirm
        eyebrow="Strzał kameleona"
        who="kameleon"
        accent={accent}
        shadowColor={accentShadow}
        onConfirm={() => setPhase('guess-handoff')}
        onBack={() => setPhase('decision')}
      />
    )
  }

  if (phase === 'guess-handoff') {
    return <PrivacyHandoff playerName="Kameleon" onReady={() => setPhase('guess-grid')} />
  }

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
        <Button variant="ghost" size="md" fullWidth onClick={() => setPhase('decision')}>
          Wróć
        </Button>
      </div>
    )
  }

  // Vote result: did majority catch the chameleon?
  if (phase === 'vote-result') {
    const { caught, deltas, facts, voteRows, impostorNames } = buildVoteSummary({
      players,
      votes,
      impostorIds,
      role: 'kameleon',
    })
    const headline = roundHeadline(caught ? 'caught' : 'escaped', {
      impostorNames,
      role: 'kameleon',
    })
    return (
      <RoundResult
        role="kameleon"
        impostorIds={impostorIds}
        players={players}
        deltas={deltas}
        winner={caught ? 'civilians' : 'impostors'}
        headline={headline}
        speech={`${headline} Tajne słowo: ${secret}.`}
        secret={{ label: 'Tajne słowo', value: secret }}
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

  // Grid-tap guess result.
  if (phase === 'result') {
    const correct = guessedWord === secret
    let deltas = Object.fromEntries(players.map((p) => [p.id, 0]))
    if (correct) {
      deltas = awardImpostorWordGuess(deltas, impostorIds, 3)
    } else {
      deltas = awardCivilians(deltas, players.map((p) => p.id), impostorIds, 1)
    }
    const headline = roundHeadline(correct ? 'guessRight' : 'guessWrong', {
      word: secret,
      role: 'kameleon',
    })
    const facts = [
      `Kameleon wskazuje: „${guessedWord}”`,
      correct
        ? 'Kameleon dostaje +3 pkt za trafione słowo'
        : 'Cywile dostają po +1 pkt za zdemaskowanie',
    ]
    return (
      <RoundResult
        role="kameleon"
        impostorIds={impostorIds}
        players={players}
        deltas={deltas}
        winner={correct ? 'impostors' : 'civilians'}
        headline={headline}
        speech={headline}
        secret={{ label: 'Tajne słowo', value: secret }}
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
