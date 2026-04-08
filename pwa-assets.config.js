import {
  defineConfig,
  minimal2023Preset as preset,
} from '@vite-pwa/assets-generator/config'

// Use the Classic-mode illustration as the source — it's 1024x1024, already
// on-brand (red card, rounded characters, masked impostor), and has the right
// aspect ratio for an app icon.
export default defineConfig({
  headLinkOptions: {
    preset: '2023',
  },
  preset,
  images: ['public/images/mode-classic.png'],
})
