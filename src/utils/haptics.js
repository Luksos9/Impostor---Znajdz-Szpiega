// Haptic feedback — fires native vibration on Capacitor, no-ops on web.
// Imported by Button.jsx so every tactile press gets a physical "click".
// Three intensities map to Capacitor's ImpactStyle enum.

import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { isNative } from './platform'

// Fire a short haptic impulse. Silent no-op on web.
export const hapticLight = () => {
  if (!isNative) return
  Haptics.impact({ style: ImpactStyle.Light }).catch(() => {})
}

export const hapticMedium = () => {
  if (!isNative) return
  Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {})
}

export const hapticHeavy = () => {
  if (!isNative) return
  Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {})
}

// Success notification — distinct feel from impact. Good for correct
// guesses, round wins, game over.
export const hapticSuccess = () => {
  if (!isNative) return
  Haptics.notification({ type: 'SUCCESS' }).catch(() => {})
}
