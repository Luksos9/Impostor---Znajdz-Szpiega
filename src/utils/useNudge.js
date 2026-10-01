import { useEffect } from 'react'
import { speak } from './voice'
import { nudgeLine } from './narration'

// Narrator pokes the table when a screen sits untouched: "Nie ociągaj się!".
// First poke after `after` ms, then every `every` ms, getting more impatient.
// Stops after `max` pokes and on unmount (so it never talks over the next screen).
export function useNudge(active = true, { after = 14000, every = 12000, max = 3 } = {}) {
  useEffect(() => {
    if (!active) return undefined
    let n = 0
    let stopSpeak = () => {}
    let timer
    const poke = () => {
      stopSpeak = speak(nudgeLine(n), { delay: 0 })
      n += 1
      if (n < max) timer = setTimeout(poke, every)
    }
    timer = setTimeout(poke, after)
    return () => {
      clearTimeout(timer)
      stopSpeak()
    }
  }, [active, after, every, max])
}
