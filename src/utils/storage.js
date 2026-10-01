// Minimal localStorage wrapper for settings only in v1.
// No active-game resume in v1 per plan. Settings persist across sessions.

const SETTINGS_KEY = 'imposter.settings'

// First launch follows the phone's light/dark setting; after that the choice sticks.
function systemTheme() {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

const baseSettings = {
  totalRounds: 5,
  soundsEnabled: true,
  voiceEnabled: true,
  impostorCount: 1,
  // themeMode: 'light' | 'dark' — filled in by defaults()
}

const defaults = () => ({ ...baseSettings, themeMode: systemTheme() })

export function getSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return defaults()
    const parsed = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return defaults()
    return { ...defaults(), ...parsed }
  } catch (err) {
    console.warn('[storage] could not parse settings:', err)
    return defaults()
  }
}

export function saveSettings(patch) {
  try {
    const current = getSettings()
    const next = { ...current, ...patch }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
    return next
  } catch (err) {
    console.error('[storage] save settings failed:', err)
    return getSettings()
  }
}

// Player names the group typed last time, so nobody retypes them every game.
const NAMES_KEY = 'imposter.names'

export function getSavedNames() {
  try {
    const parsed = JSON.parse(localStorage.getItem(NAMES_KEY) || '[]')
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'string') : []
  } catch {
    return []
  }
}

export function saveNames(names) {
  try {
    localStorage.setItem(NAMES_KEY, JSON.stringify(names))
  } catch (err) {
    console.warn('[storage] save names failed:', err)
  }
}
