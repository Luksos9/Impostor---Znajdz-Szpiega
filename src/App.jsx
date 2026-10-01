import { useEffect, useState } from 'react'
import Menu from './components/Menu'
import QuickSetup from './components/QuickSetup'
import ScoreboardHeader from './components/ScoreboardHeader'
import GameOver from './components/GameOver'
import ModeStub from './components/modes/ModeStub'
import { getMode } from './data/modes'
import { getContentForMode } from './data/packs'
import { getSettings, saveSettings, saveNames } from './utils/storage'
import { stopSpeaking } from './utils/voice'
import { applyDeltas } from './utils/scoring'
import { colors } from './styles/theme'
import { isNative } from './utils/platform'

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

    // Native: sync the Android/iOS status bar color and style.
    if (isNative) {
      import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
        StatusBar.setStyle({ style: mode === 'dark' ? Style.Dark : Style.Light }).catch(() => {})
        StatusBar.setBackgroundColor({ color: mode === 'dark' ? '#181412' : '#FFF8EC' }).catch(() => {})
      })
    }
  }, [settings.themeMode])

  const toggleTheme = () => {
    const next = settings.themeMode === 'dark' ? 'light' : 'dark'
    const nextSettings = { ...settings, themeMode: next }
    setSettings(nextSettings)
    saveSettings({ themeMode: next })
  }

  // Flip a boolean setting (soundsEnabled / voiceEnabled) and persist it.
  const toggleSetting = (key) => {
    const next = !settings[key]
    setSettings((prev) => ({ ...prev, [key]: next }))
    saveSettings({ [key]: next })
    if (key === 'voiceEnabled' && !next) stopSpeaking()
  }

  const selectMode = (id) => {
    setSelectedModeId(id)
    setScreen('setup')
  }

  const quitToMenu = () => {
    stopSpeaking()
    setScreen('menu')
    setSelectedModeId(null)
    setPlayers([])
    setGame(null)
  }

  const startGame = (roster, totalRounds, impostorCount = 1, carriedUsedIds = []) => {
    setPlayers(roster)
    // Only remember the impostor count for modes that let you choose it, so
    // playing Kameleon doesn't silently reset Classic's setting to 1.
    const remembersImpostors = !!getMode(selectedModeId)?.multiImpostor
    const patch = remembersImpostors ? { totalRounds, impostorCount } : { totalRounds }
    setSettings({ ...settings, ...patch })
    saveSettings(patch)
    saveNames(roster.map((p) => p.name))

    const initialGame = {
      modeId: selectedModeId,
      currentRound: 0,
      totalRounds,
      impostorCount,
      scores: Object.fromEntries(roster.map((p) => [p.id, 0])),
      usedContentIds: carriedUsedIds,
      history: [],
    }
    setGame(initialGame)
    setScreen('playing')
  }

  // Called by a mode when its round is over. Pure state update, then (after the
  // last round) straight to the final screen — no deferred side effect, so the
  // next round never flashes up for a frame.
  const finishRound = (result) => {
    if (!game) return
    const nextRound = game.currentRound + 1
    setGame({
      ...game,
      scores: applyDeltas(game.scores, result.deltas),
      currentRound: nextRound,
      usedContentIds: result.usedContentId
        ? [...game.usedContentIds, result.usedContentId]
        : game.usedContentIds,
      history: [...game.history, result],
    })
    if (nextRound >= game.totalRounds) setScreen('gameover')
  }

  const restartGame = () => {
    if (!players.length || !selectedModeId) {
      quitToMenu()
      return
    }
    // Carry the used words into the next game so a rematch doesn't replay them —
    // unless that would leave too few fresh ones for the whole game.
    const pool = getContentForMode(selectedModeId).length
    const used = game?.usedContentIds || []
    const carry = pool - used.length >= settings.totalRounds ? used : []
    startGame(players, settings.totalRounds, game?.impostorCount || 1, carry)
  }

  if (screen === 'menu') {
    return (
      <Menu
        onPickMode={selectMode}
        themeMode={settings.themeMode}
        onToggleTheme={toggleTheme}
        soundsEnabled={settings.soundsEnabled}
        voiceEnabled={settings.voiceEnabled}
        onToggleSounds={() => toggleSetting('soundsEnabled')}
        onToggleVoice={() => toggleSetting('voiceEnabled')}
      />
    )
  }

  if (screen === 'setup') {
    return (
      <QuickSetup
        modeId={selectedModeId}
        initialRounds={settings.totalRounds}
        initialImpostors={settings.impostorCount}
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
            maxWidth: 480,
            width: '100%',
            margin: '0 auto',
          }}
        >
          <ModeComp
            key={`${game.modeId}-${game.currentRound}`}
            players={players}
            settings={settings}
            roundIndex={game.currentRound}
            impostorCount={game.impostorCount}
            usedContentIds={game.usedContentIds}
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
