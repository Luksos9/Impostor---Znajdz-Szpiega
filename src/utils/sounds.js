// Optional sound effects. Off by default per plan.
// M2 ships with a no-op hook so components can import it safely.
// Real .mp3 files land in M7 when the UX polish pass happens.

import { useCallback } from 'react'

const SOUND_FILES = {
  reveal: '/sounds/reveal.mp3',
  vote: '/sounds/vote.mp3',
  timer: '/sounds/timer.mp3',
}

// Lazy audio element cache, shared across all components that use the hook.
const audioCache = {}

function getAudio(key) {
  if (!(key in audioCache)) {
    try {
      audioCache[key] = new Audio(SOUND_FILES[key])
      audioCache[key].preload = 'auto'
    } catch {
      audioCache[key] = null
    }
  }
  return audioCache[key]
}

// useSounds() returns a play(key) function.
// `enabled` gates all playback. When false, play() is a no-op.
export function useSounds(enabled) {
  const play = useCallback(
    (key) => {
      if (!enabled) return
      const a = getAudio(key)
      if (!a) return
      try {
        a.currentTime = 0
        a.play().catch(() => {
          // User gesture may not have happened yet; fail silently.
        })
      } catch {
        // Fail silently. Sounds are optional.
      }
    },
    [enabled]
  )
  return { play }
}
