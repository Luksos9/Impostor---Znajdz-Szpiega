import { useEffect, useState } from 'react'
import Menu from './components/Menu'
import QuickSetup from './components/QuickSetup'
import ScoreboardHeader from './components/ScoreboardHeader'
import GameOver from './components/GameOver'
import ModeStub from './components/modes/ModeStub'
import { getMode } from './data/modes'
import { getSettings, saveSettings } from './utils/storage'
import { applyDeltas } from './utils/scoring'
import { colors } from './styles/theme'

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

  // Apply the persisted theme on mount and whenever it changes.
  // Theme tokens are CSS variables keyed off [data-theme] on <html>.
  useEffect(() => {
    const mode = settings.themeMode === 'dark' ? 'dark' : 'light'
    document.documentElement.dataset.theme = mode
    // Keep the iOS status bar / browser chrome in sync with the new bg.
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', mode === 'dark' ? '#181412' : '#FFF8EC')
  }, [settings.themeMode])

  const toggleTheme = () => {
    const next = settings.themeMode === 'dark' ? 'light' : 'dark'
    const nextSettings = { ...settings, themeMode: next }
    setSettings(nextSettings)
    saveSettings({ themeMode: next })
  }

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
    return (
      <Menu
        onPickMode={selectMode}
        themeMode={settings.themeMode}
        onToggleTheme={toggleTheme}
      />
    )
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
      <div
        style={{
          height: '100dvh',
          background: colors.bg,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <ScoreboardHeader
          players={players}
          scores={game.scores}
          currentRound={game.currentRound}
          totalRounds={game.totalRounds}
          modeId={game.modeId}
          onQuit={quitToMenu}
        />
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
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
