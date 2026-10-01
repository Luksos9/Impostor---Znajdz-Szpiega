// Narrator voice via the browser's built-in speech synthesis (pl-PL).
// No audio files, works offline on most phones. Gated by settings.voiceEnabled.
// Never speak secrets (words, roles) — only public table talk.
//
// Safari/iOS quirks handled here:
//  - speak() right after cancel() is sometimes dropped  -> only cancel when
//    something is actually playing, then wait a beat.
//  - long utterances get cut off after ~15 s            -> split into sentences.
//  - voices load late / `voiceschanged` may never fire  -> poll for a while.
//  - the first speak() needs a user gesture             -> prime on the first tap.

const SETTINGS_KEY = 'imposter.settings'
const GAP_AFTER_CANCEL_MS = 60

let polishVoice = null
let voicesSeen = false

function synth() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null
}

function pickVoice() {
  const s = synth()
  if (!s) return null
  const voices = s.getVoices()
  if (!voices.length) return null
  voicesSeen = true
  // Prefer a Polish voice; among those a local (offline) one.
  const polish = voices.filter((v) => v.lang?.toLowerCase().replace('_', '-').startsWith('pl'))
  polishVoice = polish.find((v) => v.localService) || polish[0] || null
  return polishVoice
}

if (synth()) {
  pickVoice()
  synth().addEventListener?.('voiceschanged', pickVoice)
  // iOS often never fires `voiceschanged`: poll for a few seconds instead.
  let tries = 0
  const poll = setInterval(() => {
    if (pickVoice() || ++tries > 10) clearInterval(poll)
  }, 500)

  // Prime speech synthesis inside the first user gesture so later, timer-driven
  // narration is allowed to play.
  const prime = () => {
    try {
      const u = new SpeechSynthesisUtterance(' ')
      u.volume = 0
      synth().speak(u)
    } catch { /* ignore */ }
    document.removeEventListener('pointerdown', prime, true)
  }
  document.addEventListener('pointerdown', prime, true)
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

// 'unsupported' | 'loading' | 'no-polish' | 'ok' — lets the menu explain why the
// narrator may sound odd (it would read Polish with a foreign voice).
export function getVoiceStatus() {
  if (!synth()) return 'unsupported'
  if (!voicesSeen) return 'loading'
  return polishVoice ? 'ok' : 'no-polish'
}

export function stopSpeaking() {
  try { synth()?.cancel() } catch { /* ignore */ }
}

// "Pierwsze zdanie. Drugie zdanie!" -> ['Pierwsze zdanie.', 'Drugie zdanie!']
function toSentences(text) {
  return (text.match(/[^.!?]+[.!?]*/g) || [text]).map((t) => t.trim()).filter(Boolean)
}

// Speak a line, interrupting whatever is still being said so the narrator never
// lags behind the game. `delay` lets a screen finish its entrance animation.
// Returns a cleanup that cancels a not-yet-started line.
export function speak(text, { delay = 250, rate = 1.05, pitch = 1 } = {}) {
  const s = synth()
  if (!s || !text || !isVoiceEnabled()) return () => {}
  let cancelled = false
  let gapTimer

  const start = () => {
    if (cancelled) return
    if (!voicesSeen) pickVoice()
    try {
      for (const sentence of toSentences(text)) {
        const u = new SpeechSynthesisUtterance(sentence)
        u.lang = 'pl-PL'
        if (polishVoice) u.voice = polishVoice
        u.rate = rate
        u.pitch = pitch
        s.speak(u)
      }
    } catch { /* narrator is optional */ }
  }

  const timer = setTimeout(() => {
    if (cancelled) return
    if (s.speaking || s.pending) {
      s.cancel()
      gapTimer = setTimeout(start, GAP_AFTER_CANCEL_MS)
    } else {
      start()
    }
  }, delay)

  return () => {
    cancelled = true
    clearTimeout(timer)
    clearTimeout(gapTimer)
  }
}
