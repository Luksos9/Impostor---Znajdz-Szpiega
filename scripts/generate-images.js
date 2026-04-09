// Generate mode card illustrations via Google Gemini image API.
// Reads the API key from .env.local (GEMINI_API_KEY).
// Saves images to public/images/.
//
// Run: node scripts/generate-images.js [--list-models] [--only <filename>]

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.join(__dirname, '..')

// Tiny .env.local reader so we don't need dotenv as a dep.
function loadEnv() {
  const envPath = path.join(ROOT, '.env.local')
  if (!fs.existsSync(envPath)) return
  const txt = fs.readFileSync(envPath, 'utf8')
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m) process.env[m[1]] = m[2].replace(/^"(.*)"$/, '$1')
  }
}
loadEnv()

const API_KEY = process.env.GEMINI_API_KEY
if (!API_KEY) {
  console.error('GEMINI_API_KEY not set. Put it in .env.local or export it.')
  process.exit(1)
}

// Candidate model IDs in priority order. The API docs for image generation
// have used different names over time; we fall through until one works.
// Verified from GET /v1beta/models on this key:
const MODEL_CANDIDATES = [
  'gemini-3-pro-image-preview',    // Nano Banana Pro 2 (highest quality)
  'nano-banana-pro-preview',       // alias
  'gemini-3.1-flash-image-preview',// Nano Banana 2 Flash (cheaper, faster)
  'gemini-2.5-flash-image',        // Nano Banana 1
]

// Iconic 3D-rendered mode card illustrations. Single-subject compositions,
// glossy soft-plastic look, centered, square 1:1. Backgrounds use the exact
// mode accent hex values locked in src/styles/theme.js (red / blue / emerald).
const IMAGES = [
  {
    filename: 'mode-classic.png',
    prompt:
      'Iconic 3D-rendered cartoon illustration for a party game card. ' +
      'Bright coral red background, exact hex #ef4444, with a soft radial gradient from lighter red at the center to deeper red at the edges. ' +
      'Composition: a single large theatrical comedy mask (the happy smiling greek-tragedy-style mask) rendered in glossy 3D with smooth rounded edges, soft plastic shading, and cheerful friendly big cartoon eyes, sitting slightly left of center and slightly tilted. ' +
      'Beside it on the right, a second smaller cartoon "imposter" mask in deep crimson red with mischievous slanted eyes, a tiny black eye-band, and a sly devil smirk — clearly the odd one out. ' +
      'Round chunky proportions, soft ambient shadows beneath both masks, subtle pastel highlights, modern 3D soft-plastic look like Duolingo or Apple mascots. ' +
      'Playful, warm, inviting, NOT scary. Absolutely no text, no letters, no numbers, no symbols anywhere. ' +
      'Square 1:1 aspect ratio, designed for a mobile app card. ' +
      'Centered composition with generous padding around the masks so they do not touch the edges.',
  },
  {
    filename: 'mode-pairs-question.png',
    prompt:
      'Iconic 3D-rendered cartoon illustration for a party game card. ' +
      'Bright sky blue background, exact hex #3b82f6, with a soft radial gradient from lighter blue at the center to deeper blue at the edges. ' +
      'Composition: one large chunky 3D cartoon speech bubble in glossy sky blue, centered, with smooth rounded edges and subtle pastel highlights. The speech bubble is EMPTY inside, plain surface, no text, no letters. ' +
      'Around the bubble, four or five floating cartoon question marks of varying sizes in white and pale blue, gently swirling around it as if orbiting — some bigger, some smaller, at different tilt angles. The question marks are simple clean shapes, NOT made of letters. ' +
      'Round chunky proportions, soft ambient shadows, pastel highlights, modern 3D soft-plastic look like Duolingo mascots. ' +
      'Playful, warm, inviting, curious. Absolutely no text, no letters, no numbers inside the bubble or anywhere else. ' +
      'Square 1:1 aspect ratio, designed for a mobile app card. ' +
      'Centered composition with generous padding around the bubble.',
  },
  {
    filename: 'mode-kameleon.png',
    prompt:
      'Iconic 3D-rendered cartoon illustration for a party game card. ' +
      'Bright emerald green background, exact hex #10b981, with a soft radial gradient from lighter green at the center to deeper green at the edges. ' +
      'Composition: one adorable 3D cartoon chameleon mascot in vivid leaf-green with enormous friendly round cartoon eyes, a curly spiral tail, tiny stubby feet, and a small confused-curious closed-mouth smile. ' +
      'The chameleon sits centered, its curly tail coiling playfully around a small 3x3 grid of chunky saturated cartoon squares behind and beneath it. The grid squares are bright saturated cartoon colors: cherry red, sunny yellow, leaf green, sky blue, lilac purple, and orange — NOT pastel, NOT washed out, fully saturated. The squares have soft rounded corners and subtle glossy highlights. ' +
      'One square just behind the chameleon glows slightly brighter as if it holds a secret. ' +
      'Round chunky proportions, soft ambient shadows, subtle pastel highlights on the chameleon body, modern 3D soft-plastic look like Duolingo mascots (think the Duo owl style). ' +
      'Playful, warm, inviting, adorable. Absolutely no text, no letters, no numbers on the tiles or anywhere. ' +
      'Square 1:1 aspect ratio, designed for a mobile app card. ' +
      'Centered composition with generous padding around the chameleon and grid.',
  },
]

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
  const resp = await fetch(url)
  if (!resp.ok) {
    console.error(`List models failed: ${resp.status}`)
    console.error(await resp.text())
    return
  }
  const json = await resp.json()
  const models = json.models || []
  console.log(`Found ${models.length} models. Image-capable ones:`)
  for (const m of models) {
    const methods = m.supportedGenerationMethods || []
    const name = (m.name || '').replace('models/', '')
    if (/image/i.test(name) || m.outputTokenLimit > 0) {
      console.log(`  ${name}  (methods: ${methods.join(',')})`)
    }
  }
}

async function tryModel(modelName, item) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`
  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: item.prompt }],
      },
    ],
    generationConfig: {
      responseModalities: ['IMAGE'],
    },
  }
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!resp.ok) {
    const text = await resp.text()
    return { ok: false, status: resp.status, text }
  }
  const json = await resp.json()
  const parts = json.candidates?.[0]?.content?.parts || []
  const imagePart = parts.find((p) => p.inlineData)
  if (!imagePart) {
    return { ok: false, status: 'no-image', text: JSON.stringify(json).slice(0, 500) }
  }
  return { ok: true, mime: imagePart.inlineData.mimeType, base64: imagePart.inlineData.data }
}

async function generateImage(item, workingModel) {
  const outDir = path.join(ROOT, 'public', 'images')
  fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, item.filename)

  // If we already have a known working model, just use it. Otherwise try each.
  if (workingModel) {
    const r = await tryModel(workingModel, item)
    if (r.ok) {
      fs.writeFileSync(outPath, Buffer.from(r.base64, 'base64'))
      console.log(`  ✓ ${item.filename} (${r.mime}) via ${workingModel}`)
      return workingModel
    }
    console.log(`  ✗ ${workingModel} failed: ${r.status} ${String(r.text).slice(0, 120)}`)
  }

  for (const model of MODEL_CANDIDATES) {
    const r = await tryModel(model, item)
    if (r.ok) {
      fs.writeFileSync(outPath, Buffer.from(r.base64, 'base64'))
      console.log(`  ✓ ${item.filename} (${r.mime}) via ${model}`)
      return model
    }
    console.log(`  · ${model} -> ${r.status}  ${String(r.text || '').slice(0, 300)}`)
  }
  throw new Error(`No model worked for ${item.filename}`)
}

async function main() {
  const args = process.argv.slice(2)
  if (args.includes('--list-models')) {
    await listModels()
    return
  }
  const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null

  let workingModel = null
  for (const item of IMAGES) {
    if (only && item.filename !== only) continue
    console.log(`Generating ${item.filename}...`)
    try {
      workingModel = await generateImage(item, workingModel)
    } catch (err) {
      console.error(`  FAILED: ${err.message}`)
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
