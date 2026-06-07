// Synthesized game sounds via Web Audio API — no .mp3 files needed.
// Each sound is a short sequence of oscillators/noise shaped by gain
// envelopes. Sounds are gated by a global `enabled` flag so the user
// can mute them. AudioContext is created lazily on first user gesture
// to comply with browser autoplay policies.

import { useCallback } from 'react'

let ctx = null
function getCtx() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)()
    } catch {
      return null
    }
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

function tone(freq, duration, type = 'sine', volume = 0.3) {
  const c = getCtx()
  if (!c) return
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(volume, c.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)
  osc.connect(gain)
  gain.connect(c.destination)
  osc.start(c.currentTime)
  osc.stop(c.currentTime + duration)
}

const SOUNDS = {
  tap() {
    tone(800, 0.06, 'sine', 0.15)
  },

  reveal() {
    const c = getCtx()
    if (!c) return
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(400, c.currentTime)
    osc.frequency.exponentialRampToValueAtTime(1200, c.currentTime + 0.15)
    gain.gain.setValueAtTime(0.2, c.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.2)
    osc.connect(gain)
    gain.connect(c.destination)
    osc.start(c.currentTime)
    osc.stop(c.currentTime + 0.2)
  },

  vote() {
    tone(300, 0.08, 'triangle', 0.25)
    setTimeout(() => tone(200, 0.1, 'triangle', 0.2), 40)
  },

  correct() {
    tone(523, 0.15, 'sine', 0.25)
    setTimeout(() => tone(659, 0.15, 'sine', 0.25), 100)
    setTimeout(() => tone(784, 0.2, 'sine', 0.3), 200)
  },

  wrong() {
    tone(200, 0.25, 'square', 0.15)
    setTimeout(() => tone(150, 0.3, 'square', 0.12), 100)
  },

  roundEnd() {
    tone(440, 0.12, 'sine', 0.2)
    setTimeout(() => tone(554, 0.12, 'sine', 0.2), 100)
    setTimeout(() => tone(659, 0.18, 'sine', 0.25), 200)
  },

  celebrate() {
    tone(523, 0.12, 'sine', 0.2)
    setTimeout(() => tone(659, 0.12, 'sine', 0.2), 80)
    setTimeout(() => tone(784, 0.12, 'sine', 0.2), 160)
    setTimeout(() => tone(1047, 0.3, 'sine', 0.3), 240)
    setTimeout(() => {
      tone(784, 0.15, 'sine', 0.15)
      tone(1047, 0.15, 'sine', 0.15)
    }, 500)
  },
}

export function playSound(key) {
  try {
    const raw = localStorage.getItem('imposter.settings')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.soundsEnabled === false) return
    }
  } catch { /* play anyway if storage fails */ }

  const fn = SOUNDS[key]
  if (fn) {
    try { fn() } catch { /* fail silently */ }
  }
}

export function useSounds(enabled) {
  const play = useCallback(
    (key) => {
      if (!enabled) return
      playSound(key)
    },
    [enabled]
  )
  return { play }
}
