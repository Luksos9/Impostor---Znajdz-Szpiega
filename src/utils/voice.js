// Narrator voice via the browser's built-in speech synthesis (pl-PL).
// No audio files, works offline on most phones. Gated by settings.voiceEnabled.
// Never speak secrets (words, roles) — only public table talk.

const SETTINGS_KEY = 'imposter.settings'

let polishVoice = null
let voicesLoaded = false

function synth() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null
}

function pickVoice() {
  const s = synth()
  if (!s) return null
  const voices = s.getVoices()
  if (!voices.length) return null
  voicesLoaded = true
  // Prefer a Polish voice; among those prefer a local (offline) one.
  const polish = voices.filter((v) => v.lang?.toLowerCase().startsWith('pl'))
  polishVoice = polish.find((v) => v.localService) || polish[0] || null
  return polishVoice
}

if (synth()) {
  pickVoice()
  // Chrome/Android load voices asynchronously.
  synth().addEventListener?.('voiceschanged', pickVoice)
}

export function isVoiceEnabled() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw && JSON.parse(raw).voiceEnabled === false) return false
  } catch { /* default on */ }
  return true
}

export function isVoiceSupported() {
  return !!synth()
}

export function stopSpeaking() {
  try { synth()?.cancel() } catch { /* ignore */ }
}

// Speak a line. Interrupts anything still being said so the narrator never
// lags behind the game. `delay` lets a screen finish its entrance animation.
export function speak(text, { delay = 250, rate = 1.05, pitch = 1 } = {}) {
  const s = synth()
  if (!s || !text || !isVoiceEnabled()) return () => {}
  let cancelled = false
  const timer = setTimeout(() => {
    if (cancelled) return
    try {
      s.cancel()
      if (!voicesLoaded) pickVoice()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'pl-PL'
      if (polishVoice) u.voice = polishVoice
      u.rate = rate
      u.pitch = pitch
      s.speak(u)
    } catch { /* narrator is optional */ }
  }, delay)
  // Cleanup: if the screen unmounts before the delay, don't speak late.
  return () => {
    cancelled = true
    clearTimeout(timer)
  }
}
