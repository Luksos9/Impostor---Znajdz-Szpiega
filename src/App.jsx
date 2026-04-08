import { useState } from 'react'
import Menu from './components/Menu'
import QuickSetup from './components/QuickSetup'
import ScoreboardHeader from './components/ScoreboardHeader'
import GameOver from './components/GameOver'
import ModeStub from './components/modes/ModeStub'
import { getMode } from './data/modes'
import { getSettings, saveSettings } from './utils/storage'
import { applyDeltas } from './utils/scoring'

// Top-level state machine.
// Screens: 'menu' → 'setup' → 'playing' → 'gameover'
// M2 scope: all shared components wired to a stub mode for verification.
// M3 will replace ModeStub with ModeClassic.
export default function App() {
  const [screen, setScreen] = useState('menu')
  const [selectedModeId, setSelectedModeId] = useState(null)
  const [players, setPlayers] = useState([])
  const [settings, setSettings] = useState(() => getSettings())
  const [game, setGame] = useState(null)

  const selectMode = (id) => {
    setSelectedModeId(id)
    setScreen('setup')
  }

  const quitToMenu = () => {
    setScreen('menu')
    setSelectedModeId(null)
    setPlayers([])
    setGame(null)
  }

  const startGame = (roster, totalRounds) => {
    setPlayers(roster)
    const nextSettings = { ...settings, totalRounds }
    setSettings(nextSettings)
    saveSettings({ totalRounds })

    const initialGame = {
      modeId: selectedModeId,
      currentRound: 0,
      totalRounds,
      scores: Object.fromEntries(roster.map((p) => [p.id, 0])),
      usedContentIds: [],
      history: [],
    }
    setGame(initialGame)

    console.log('[imposter] startGame', {
      modeId: selectedModeId,
      players: roster,
      totalRounds,
      settings: nextSettings,
    })

    setScreen('playing')
  }

  const finishRound = (result) => {
    setGame((prev) => {
      if (!prev) return prev
      const nextScores = applyDeltas(prev.scores, result.deltas)
      const nextRound = prev.currentRound + 1
      const nextUsed = result.usedContentId
        ? [...prev.usedContentIds, result.usedContentId]
        : prev.usedContentIds
      const nextHistory = [...prev.history, result]
      const next = {
        ...prev,
        scores: nextScores,
        currentRound: nextRound,
        usedContentIds: nextUsed,
        history: nextHistory,
      }
      if (nextRound >= prev.totalRounds) {
        // Defer the screen transition so React commits the final scores first.
        setTimeout(() => setScreen('gameover'), 0)
      }
      return next
    })
  }

  const restartGame = () => {
    if (!players.length || !selectedModeId) {
      quitToMenu()
      return
    }
    startGame(players, settings.totalRounds)
  }

  if (screen === 'menu') {
    return <Menu onPickMode={selectMode} />
  }

  if (screen === 'setup') {
    return (
      <QuickSetup
        modeId={selectedModeId}
        initialRounds={settings.totalRounds}
        onBack={quitToMenu}
        onStart={startGame}
      />
    )
  }

  if (screen === 'playing' && game) {
    const isLastRound = game.currentRound >= game.totalRounds - 1
    const mode = getMode(game.modeId)
    const ModeComp = mode?.Component || ModeStub
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
        <ScoreboardHeader
          players={players}
          scores={game.scores}
          currentRound={game.currentRound}
          totalRounds={game.totalRounds}
          onQuit={quitToMenu}
        />
        <ModeComp
          key={`${game.modeId}-${game.currentRound}`}
          players={players}
          settings={settings}
          roundIndex={game.currentRound}
          isLastRound={isLastRound}
          onRoundComplete={finishRound}
          onQuit={quitToMenu}
        />
      </div>
    )
  }

  if (screen === 'gameover' && game) {
    return (
      <GameOver
        players={players}
        scores={game.scores}
        onRestart={restartGame}
        onMenu={quitToMenu}
      />
    )
  }

  return null
}
