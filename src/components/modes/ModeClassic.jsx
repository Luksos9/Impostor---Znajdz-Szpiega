import { useEffect, useId, useRef, useState } from 'react'
import { hapticHeavy } from '../../utils/haptics'
import PrivacyHandoff from '../PrivacyHandoff'
import GuessConfirm from '../GuessConfirm'
import GuesserPick from '../GuesserPick'
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
import { compareWordGuess } from '../../utils/scoring'
import { caughtBy, resolveQuickVote, resolveVote, scoreRound, wrongGuessEntry } from '../../utils/elimination'
import { playSound } from '../../utils/sounds'
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
  wrongGuessLine,
  catchLine,
  partnersLine,
  joinNames,
} from '../../utils/narration'
import { useNudge } from '../../utils/useNudge'
import { L, t } from '../../utils/labels'

const MAX_TURNS = 3
const MODE_ID = 'classic'

// Klasyczny impostor: the hero mode.
// Flow: reveal → describe (N turns, rotation) → decision → vote or guess → result
//
// Several impostors know each other (shown on their private card) and are
// caught ONE AT A TIME: each vote exposes at most one player; after a catch the
// table plays on or votes again for the next. See utils/elimination.js.
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
  // With several impostors still hidden, the guesser taps their own name
  // (privately) so a wrong guess knocks out only them.
  const [guesserId, setGuesserId] = useState(null)
  // Where "Wróć" goes if the table backs out of an impostor guess.
  const guessReturnRef = useRef('decision')
  // One-at-a-time catching: who is out, every vote so far, and why it ended.
  const [caughtIds, setCaughtIds] = useState([])
  const [voteLog, setVoteLog] = useState([])
  const [endReason, setEndReason] = useState(null)
  const [lastCatchIds, setLastCatchIds] = useState(null)
  const spokenCatchRef = useRef(null)

  const reactId = useId()
  const safeId = reactId.replace(/:/g, '')
  const guessInputClass = `guess-input-${safeId}`

  const accent = colorForMode(MODE_ID)
  const accentShadow = colorForModeShadow(MODE_ID)
  // The phone travels round the table in seat order (the numbers from setup) for
  // cards and votes; only the speaking order is shuffled.
  const currentRevealPlayer = players[revealIdx]
  // Caught impostors leave the table: they no longer speak or vote.
  const activeOrder = speakerOrder.filter((id) => !caughtIds.includes(id))
  const activePlayers = players.filter((p) => !caughtIds.includes(p.id))
  const civilianCount = players.length - impostorIds.length
  const hiddenCount = impostorIds.length - caughtIds.length
  const nameOf = (id) => players.find((p) => p.id === id)?.name || ''
  const currentSpeaker = players.find((p) => p.id === activeOrder[speakerIdx])
  const voterSeats = activePlayers.map((p) => p.id)
  const currentVoter = players.find((p) => p.id === voterSeats[voteIdx])

  // Narrator: announce each speaker, each new turn, the decision and the guess.
  useEffect(() => {
    if (phase === 'describe') {
      const speaker = players.find((p) => p.id === activeOrder[speakerIdx])
      if (!speaker) return undefined
      const prefix = speakerIdx === 0 && turn > 1 ? `${turnLine(turn)} ` : ''
      return speak(`${prefix}${speakerLine(speaker.name)} ${speakerQuip()}`.trim())
    }
    if (phase === 'decision') {
      // Announce a fresh catch once; afterwards the usual "what now?".
      if (lastCatchIds && spokenCatchRef.current !== lastCatchIds) {
        spokenCatchRef.current = lastCatchIds
        const last = voteLog[voteLog.length - 1]
        return speak(
          last?.wrongGuess
            ? wrongGuessLine(nameOf(last.guesserId), hiddenCount)
            : catchLine(lastCatchIds.map(nameOf), hiddenCount)
        )
      }
      return speak(decisionLine())
    }
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
        step={`${revealIdx + 1} / ${players.length}`}
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
        // Impostors see who their partners are (only on this private card).
        partners={
          isImp && impostorIds.length > 1
            ? partnersLine(impostorIds.filter((id) => id !== currentRevealPlayer.id).map(nameOf))
            : undefined
        }
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
              if (nextSpeakerIdx >= activeOrder.length) {
                setPhase('decision')
              } else {
                setSpeakerIdx(nextSpeakerIdx)
              }
            }}
            style={{ minWidth: 240 }}
          >
            {speakerIdx === activeOrder.length - 1 ? 'Koniec tury' : L.classic.nextPlayer}
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

        {lastCatchIds && (
          <div
            key={lastCatchIds.join()}
            role="status"
            className="anim-bounce"
            style={{
              background: colors.success,
              color: '#FFFFFF',
              borderRadius: radii.xl,
              padding: `${spacing.md}px ${spacing.lg}px`,
              marginBottom: spacing.lg,
            }}
          >
            <div style={{ fontSize: fontSizes.h3, fontWeight: fontWeights.black, lineHeight: 1.15 }}>
              {voteLog[voteLog.length - 1]?.wrongGuess
                ? `Pudło! ${nameOf(lastCatchIds[0])} odpada.`
                : `Mamy: ${joinNames(lastCatchIds.map(nameOf))}!`}
            </div>
            <div style={{ fontSize: fontSizes.body, fontWeight: fontWeights.bold, marginTop: spacing.xs }}>
              {lastCatchIds.length > 1 ? 'To impostorzy.' : 'To impostor.'} {hiddenCount === 1 ? 'Został jeszcze jeden.' : `Zostało jeszcze ${hiddenCount}.`}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          <Button
            variant="primary"
            size="lg"
            accentColor={accent}
            shadowColor={accentShadow}
            fullWidth
            onClick={() => {
              setLastCatchIds(null)
              setVoteIdx(0)
              setVotes({})
              setPhase('vote-handoff')
            }}
          >
            {caughtIds.length > 0 ? 'Głosujemy na następnego' : L.classic.callVote}
          </Button>

          <Button
            variant="secondary"
            size="lg"
            accentColor={accent}
            fullWidth
            onClick={() => {
              setLastCatchIds(null)
              setPhase('open-vote')
            }}
          >
            {hiddenCount > 1
              ? `⚡ Wszyscy wiedzą? Wskażcie ${hiddenCount} naraz`
              : '⚡ Wszyscy wiedzą? Wskażcie od razu'}
          </Button>

          {turn < MAX_TURNS && (
            <Button
              variant="secondary"
              size="lg"
              accentColor={accent}
              fullWidth
              onClick={() => {
                setLastCatchIds(null)
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
        step={`${voteIdx + 1} / ${voterSeats.length}`}
        intro={voteIdx === 0 ? voteStartLine() : undefined}
        onReady={() => setPhase('vote-entry')}
      />
    )
  }

  // After a vote: end the round, or (some impostors still hidden) go back to
  // the decision screen.
  const finishVote = (outcome) => {
    const newlyCaught = caughtBy(outcome)
    const nextCaught = [...caughtIds, ...newlyCaught]
    setVoteLog((log) => [...log, outcome])
    if (newlyCaught.length === 0) {
      setEndReason('vote-failed')
      setPhase('round-end')
    } else if (nextCaught.length >= impostorIds.length) {
      setCaughtIds(nextCaught)
      setEndReason('all-caught')
      setPhase('round-end')
    } else {
      playSound('correct')
      setCaughtIds(nextCaught)
      setLastCatchIds(newlyCaught)
      setSpeakerIdx(0)
      setPhase('decision')
    }
  }

  if (phase === 'vote-entry') {
    return (
      <VoteGrid
        players={activePlayers}
        voterId={currentVoter.id}
        voterName={currentVoter.name}
        accent={accent}
        onVote={(targetId) => {
          const nextVotes = { ...votes, [currentVoter.id]: targetId }
          setVotes(nextVotes)
          const nextIdx = voteIdx + 1
          if (nextIdx >= voterSeats.length) {
            // Everyone voted: this vote can expose at most ONE impostor.
            finishVote(resolveVote({ votes: nextVotes, impostorIds, caughtIds, civilianCount }))
          } else {
            setVoteIdx(nextIdx)
            setPhase('vote-handoff')
          }
        }}
      />
    )
  }

  // Open vote: the table already agrees, so nobody passes the phone. Everyone
  // points at the same suspect(s) and one tap counts as every player's vote
  // (nobody votes for themselves). Impostor votes never count anyway.
  if (phase === 'open-vote') {
    return (
      <VoteGrid
        players={activePlayers}
        voterId={null}
        voterName="Cały stół"
        accent={accent}
        maxPicks={hiddenCount}
        requireConfirm
        instruction={
          hiddenCount > 1
            ? `Wskażcie razem, kogo podejrzewacie (do ${hiddenCount} osób)`
            : 'Wskażcie razem, kogo podejrzewacie'
        }
        speech="Wskażcie razem palcem. Raz, dwa, trzy!"
        onBack={() => setPhase('decision')}
        onVote={(picks) => {
          const votes = {}
          for (const id of voterSeats) {
            const mine = picks.filter((t) => t !== id)
            if (mine.length) votes[id] = mine
          }
          const outcome = resolveQuickVote({ votes, impostorIds, caughtIds, civilianCount })
          finishVote({ ...outcome, open: true, picks })
        }}
      />
    )
  }

  // Impostor guess handoff → guess form.
  if (phase === 'guess-confirm') {
    return (
      <GuessConfirm
        eyebrow="Strzał impostora"
        note={hiddenCount > 1 ? 'Trafienie kończy rundę, a pudło wyrzuca tylko tego, kto zgaduje.' : undefined}
        speech={hiddenCount > 1 ? 'Ktoś chce zgadywać? Trafienie kończy rundę, pudło wyrzuca tylko zgadującego. Na pewno?' : undefined}
        accent={accent}
        shadowColor={accentShadow}
        onConfirm={() => setPhase('guess-handoff')}
        onBack={backFromGuess}
      />
    )
  }

  if (phase === 'guess-handoff') {
    return (
      <PrivacyHandoff
        playerName="Impostor"
        onReady={() => {
          setGuesserId(null)
          setGuessText('')
          setPhase('guess-entry')
        }}
      />
    )
  }

  if (phase === 'guess-entry' && hiddenCount > 1 && !guesserId) {
    return (
      <GuesserPick
        players={activePlayers}
        impostorIds={impostorIds}
        accent={accent}
        onPick={setGuesserId}
        onBack={backFromGuess}
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
            if (compareWordGuess(guessText, content.word)) {
              setEndReason('guess-right')
              setPhase('round-end')
              return
            }
            // Wrong: only the guesser is out; partners still hidden play on.
            const guesser = guesserId || impostorIds.find((id) => !caughtIds.includes(id))
            const entry = wrongGuessEntry(guesser, guessText.trim())
            if (caughtIds.length + 1 >= impostorIds.length) {
              setVoteLog((log) => [...log, entry])
              setCaughtIds([...caughtIds, guesser])
              setEndReason('guess-wrong')
              setPhase('round-end')
            } else {
              finishVote(entry)
            }
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

  // Round over: score every impostor on their own (see utils/elimination.js).
  if (phase === 'round-end') {
    const { deltas, winner, caughtIds: caught, hiddenIds } = scoreRound({
      players,
      impostorIds,
      voteLog,
      reason: endReason,
    })
    const plural = impostorIds.length > 1
    const guessed = endReason === 'guess-right' || endReason === 'guess-wrong'

    let headline
    if (guessed) {
      headline = roundHeadline(endReason === 'guess-right' ? 'guessRight' : 'guessWrong', {
        word: content.word,
        plural,
      })
    } else if (endReason === 'all-caught') {
      headline = roundHeadline('caught', { impostorNames: impostorIds.map(nameOf), plural })
    } else if (caught.length > 0) {
      headline = roundHeadline('partial', {
        caughtNames: caught.map(nameOf),
        escapedNames: hiddenIds.map(nameOf),
      })
    } else {
      headline = roundHeadline('escaped', { impostorNames: impostorIds.map(nameOf), plural })
    }

    // Plain-language story: each vote, then how the points were earned.
    const voteCount = voteLog.filter((v) => !v.wrongGuess).length
    let voteNo = 0
    const facts = voteLog.map((v) => {
      if (v.wrongGuess) return `${nameOf(v.guesserId)} zgaduje „${v.guess}” — pudło, odpada (każdy cywil +1)`
      voteNo += 1
      const label = voteCount > 1 ? `Głosowanie ${voteNo}: ` : ''
      const hits = v.hitVoterIds.length
      if (v.open) {
        const got = v.caughtIds.map(nameOf)
        const missed = v.picks.filter((id) => !v.caughtIds.includes(id)).map(nameOf)
        const parts = []
        if (got.length) parts.push(`złapano: ${joinNames(got)}`)
        if (missed.length) parts.push(`${joinNames(missed)} — to nie impostor`)
        return `${label}wspólne wskazanie, ${parts.join('; ')}${got.length ? '' : '!'}`
      }
      if (v.caughtId) return `${label}złapano: ${nameOf(v.caughtId)} (${hits} z ${civilianCount} cywili)`
      if (v.wrongAccusation) return `${label}wskazano: ${nameOf(v.accusedId)} — a to nie impostor!`
      return `${label}${v.tie ? 'głosy po równo' : 'brak większości'} (trzeba było ${v.needed} z ${civilianCount} cywili)`
    })
    if (endReason === 'guess-right') facts.push(`Impostor zgaduje: „${guessText.trim()}”`)
    if (voteLog.some((v) => v.hitVoterIds.length)) facts.push('Cywile dostają po +1 pkt za każdy trafny głos')
    if (endReason === 'vote-failed' && hiddenIds.length)
      facts.push(`${joinNames(hiddenIds.map(nameOf))}: +2 pkt za przetrwanie`)
    if (endReason === 'guess-right') facts.push(`${joinNames(hiddenIds.map(nameOf))}: +3 pkt za trafione słowo`)

    const lastVote = voteLog[voteLog.length - 1]
    const voteRows = lastVote && !lastVote.open && !lastVote.wrongGuess
      ? Object.entries(lastVote.votes).map(([voterId, target]) => ({
          voter: nameOf(voterId),
          target: [].concat(target).map(nameOf).join(', '),
          hit: [].concat(target).some((t) => impostorIds.includes(t)) && !impostorIds.includes(voterId),
          votesReceived: lastVote.counts[voterId] || 0,
        }))
      : undefined

    return (
      <RoundResult
        impostorIds={impostorIds}
        caughtIds={caught}
        players={players}
        deltas={deltas}
        winner={winner}
        headline={headline}
        speech={guessed ? headline : `${headline} Tajne słowo: ${content.word}.`}
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

  return null
}
