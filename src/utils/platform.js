// Platform detection — thin wrapper around Capacitor's runtime check.
// Lets components conditionally use native features (haptics, status bar)
// while keeping the PWA version on Vercel fully functional with no-ops.

import { Capacitor } from '@capacitor/core'

export const isNative = Capacitor.isNativePlatform()
export const isIOS = Capacitor.getPlatform() === 'ios'
export const isAndroid = Capacitor.getPlatform() === 'android'
export const isWeb = Capacitor.getPlatform() === 'web'
