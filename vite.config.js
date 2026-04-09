import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon-180x180.png',
        'images/classic.png',
        'images/questions.png',
        'images/kameleon.png',
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
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,ico,woff2}'],
        // Let the SW kick in immediately on updates so users don't get stuck
        // on an old version after a redeploy.
        clientsClaim: true,
        skipWaiting: true,
      },
      devOptions: {
        // Enable the plugin during `vite dev` to test install flow locally.
        enabled: false,
      },
    }),
  ],
})
