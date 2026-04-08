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

// Duolingo-style prompts: bright saturated backgrounds, chunky cartoon characters
// with big friendly eyes, soft rounded shapes, kid-friendly, playful.
const IMAGES = [
  {
    filename: 'mode-classic.png',
    prompt:
      'Cute Duolingo-style kid-friendly cartoon mascot illustration for a party game card. ' +
      'Bright coral red background (#ef4444) with a soft radial gradient. ' +
      'Composition: four chunky round cartoon characters with huge friendly round eyes and soft rubbery bodies, ' +
      'three identical cheerful civilian characters in pastel outfits standing in a row, ' +
      'and one adorable impostor character in the middle wearing a tiny black eye mask and giggling mischievously, ' +
      'with a floating cartoon question mark bubble above its head. ' +
      'Round chunky proportions, soft ambient shadows, clean flat shading with pastel highlights, ' +
      'modern 3D-rendered soft plastic look like Duolingo mascots. ' +
      'Playful, warm, inviting, NOT scary. No text, no letters. ' +
      'Square 1:1 aspect ratio, designed for a mobile app card. ' +
      'Centered composition with generous padding around the characters.',
  },
  {
    filename: 'mode-pairs-question.png',
    prompt:
      'Cute Duolingo-style kid-friendly cartoon mascot illustration for a party game card. ' +
      'Bright sky blue background (#3b82f6) with a soft radial gradient. ' +
      'Composition: four chunky cartoon speech bubble characters with huge friendly round eyes and small arms, ' +
      'arranged in a 2x2 grid, three identical happy smiling bubbles in a row ' +
      'and one bubble in the corner with a confused puzzled expression, tilted head, and a tiny squiggle over it. ' +
      'Round chunky proportions, soft ambient shadows, pastel highlights, ' +
      'modern 3D-rendered soft plastic look like Duolingo mascots. ' +
      'Playful, warm, inviting, fun. No text, no letters inside the bubbles. ' +
      'Square 1:1 aspect ratio, designed for a mobile app card. ' +
      'Centered composition with generous padding around the characters.',
  },
  {
    filename: 'mode-kameleon.png',
    prompt:
      'Cute Duolingo-style kid-friendly cartoon mascot illustration for a party game card. ' +
      'Bright emerald green background (#10b981) with a soft radial gradient. ' +
      'Composition: one adorable chunky cartoon chameleon mascot character with enormous friendly round eyes, ' +
      'a curly tail, tiny feet, and a small confused-curious smile, ' +
      'sitting on top of a 4x4 grid of soft rounded colorful pastel tiles, ' +
      'one tile glowing brighter as if it holds a secret. ' +
      'Round chunky proportions, soft ambient shadows, pastel highlights, ' +
      'modern 3D-rendered soft plastic look like Duolingo mascots (think the Duo owl). ' +
      'Playful, warm, inviting, adorable. No text, no letters on the tiles. ' +
      'Square 1:1 aspect ratio, designed for a mobile app card. ' +
      'Centered composition with generous padding around the chameleon.',
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
