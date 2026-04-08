// Minimal localStorage wrapper for settings only in v1.
// No active-game resume in v1 per plan. Settings persist across sessions.

const SETTINGS_KEY = 'imposter.settings'

const DEFAULT_SETTINGS = {
  totalRounds: 5,
  soundsEnabled: false,
}

export function getSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    const parsed = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return { ...DEFAULT_SETTINGS }
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch (err) {
    console.warn('[storage] could not parse settings:', err)
    return { ...DEFAULT_SETTINGS }
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
