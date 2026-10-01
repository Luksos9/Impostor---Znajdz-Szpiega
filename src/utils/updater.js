// Safe app updates. The service worker installs a new version in the background
// but does NOT take over by itself (that used to reload the page mid-round).
// App.jsx applies it only when the player is idle on the menu.

import { registerSW } from 'virtual:pwa-register'

const CHECK_EVERY_MS = 30 * 60 * 1000
let updateServiceWorker = null
let ready = false
const listeners = new Set()

export function initUpdater() {
  updateServiceWorker = registerSW({
    immediate: true,
    onNeedRefresh() {
      ready = true
      listeners.forEach((fn) => fn(true))
    },
    onRegisteredSW(_url, registration) {
      if (!registration) return
      // A standalone iOS PWA is rarely relaunched, so ask for updates ourselves:
      // whenever the app comes back to the foreground and every 30 minutes.
      const check = () => registration.update().catch(() => {})
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check()
      })
      setInterval(check, CHECK_EVERY_MS)
    },
  })
}

export function isUpdateReady() {
  return ready
}

export function onUpdateReady(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

// Activate the waiting worker and reload onto the new version.
export function applyUpdate() {
  updateServiceWorker?.(true)
}
