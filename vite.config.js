import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

// https://vite.dev/config/
// Shown in the menu footer so friends can tell which version they are on.
const APP_VERSION = `${pkg.version}${
  process.env.VERCEL_GIT_COMMIT_SHA ? ` · ${process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7)}` : ''
}`

export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify(APP_VERSION) },
  plugins: [
    react(),
    VitePWA({
      // 'prompt': a new service worker waits until the app applies it (on the menu).
      registerType: 'prompt',
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon-180x180.png',
        'images/classic.webp',
        'images/questions.webp',
        'images/kameleon.webp',
      ],
      manifest: {
        name: 'Impostor — Gra imprezowa',
        short_name: 'Impostor',
        description:
          'Polska gra imprezowa na jeden telefon. Opisuj słowa, znajdź impostora, dobrze się baw.',
        theme_color: '#FFF8EC',
        background_color: '#FFF8EC',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'pl',
        categories: ['games', 'entertainment'],
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Cache everything so the game works fully offline after first visit.
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,webp,ico,woff2}'],
        // No skipWaiting: the app activates updates itself, when it is idle.
        clientsClaim: true,
      },
      devOptions: {
        // Enable the plugin during `vite dev` to test install flow locally.
        enabled: false,
      },
    }),
  ],
})
