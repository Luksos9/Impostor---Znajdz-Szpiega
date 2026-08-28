// Synthesized game sounds via Web Audio API — no .mp3 files needed.
// AudioContext is unlocked on the first user gesture (touchstart/click)
// so that subsequent playSound() calls from useEffect work reliably.

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

// One-time unlock: create + resume AudioContext on first user gesture.
function unlockAudio() {
  getCtx()
  document.removeEventListener('touchstart', unlockAudio, true)
  document.removeEventListener('click', unlockAudio, true)
}
document.addEventListener('touchstart', unlockAudio, true)
document.addEventListener('click', unlockAudio, true)

export { getCtx as ensureAudioContext }

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
    tone(800, 0.06, 'sine', 0.25)
    tone(1600, 0.04, 'sine', 0.1)
  },

  reveal() {
    const c = getCtx()
    if (!c) return
    const makeOsc = (startFreq, endFreq, vol) => {
      const osc = c.createOscillator()
      const gain = c.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(startFreq, c.currentTime)
      osc.frequency.exponentialRampToValueAtTime(endFreq, c.currentTime + 0.18)
      gain.gain.setValueAtTime(vol, c.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.22)
      osc.connect(gain)
      gain.connect(c.destination)
      osc.start(c.currentTime)
      osc.stop(c.currentTime + 0.22)
    }
    makeOsc(400, 1200, 0.3)
    makeOsc(800, 2400, 0.12)
  },

  vote() {
    tone(250, 0.1, 'triangle', 0.35)
    tone(120, 0.12, 'sine', 0.2)
    setTimeout(() => tone(180, 0.1, 'triangle', 0.25), 50)
  },

  correct() {
    tone(523, 0.15, 'sine', 0.35)
    tone(1047, 0.12, 'sine', 0.12)
    setTimeout(() => {
      tone(659, 0.15, 'sine', 0.35)
      tone(1318, 0.12, 'sine', 0.12)
    }, 110)
    setTimeout(() => {
      tone(784, 0.25, 'sine', 0.4)
      tone(1568, 0.2, 'sine', 0.15)
    }, 220)
  },

  wrong() {
    tone(200, 0.3, 'square', 0.2)
    tone(195, 0.3, 'sawtooth', 0.1)
    setTimeout(() => {
      tone(150, 0.35, 'square', 0.18)
      tone(147, 0.35, 'sawtooth', 0.08)
    }, 120)
  },

  roundEnd() {
    tone(440, 0.12, 'sine', 0.3)
    tone(880, 0.1, 'sine', 0.1)
    setTimeout(() => tone(554, 0.12, 'sine', 0.3), 110)
    setTimeout(() => {
      tone(659, 0.2, 'sine', 0.35)
      tone(1318, 0.15, 'sine', 0.12)
    }, 220)
  },

  celebrate() {
    tone(523, 0.12, 'sine', 0.3)
    setTimeout(() => tone(659, 0.12, 'sine', 0.3), 80)
    setTimeout(() => tone(784, 0.12, 'sine', 0.3), 160)
    setTimeout(() => {
      tone(1047, 0.35, 'sine', 0.4)
      tone(523, 0.3, 'sine', 0.15)
      tone(784, 0.3, 'sine', 0.15)
    }, 260)
    setTimeout(() => {
      tone(784, 0.12, 'sine', 0.2)
      tone(1047, 0.12, 'sine', 0.2)
    }, 500)
    setTimeout(() => {
      tone(1047, 0.4, 'sine', 0.35)
      tone(1568, 0.3, 'sine', 0.12)
    }, 620)
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
