import sharp from 'sharp'
import { readdirSync } from 'fs'
import { join } from 'path'

const FRUITS_DIR = join(import.meta.dirname, '..', 'public', 'fruits')
const SIZE = 2048
const BG_THRESHOLD = 35
const TARGET_FILL = 0.75

const FRUIT_CONFIG = {
  'kitsune':              { rarity: 'Mythical' },
  'tiger':                { rarity: 'Legendary' },
  'yeti':                 { rarity: 'Legendary' },
  'lobo':                 { rarity: 'Legendary' },
  'fiend-yeti':           { rarity: 'Mythical', removeBg: true },
  'rumble-verde':         { rarity: 'Legendary', removeBg: true },
  'rumble-amarilla':      { rarity: 'Mythical' },
  'super-spirit-pain':    { rarity: 'Mythical' },
  'divine-portal':        { rarity: 'Mythical' },
}

const RARITY_GLOW = {
  Mythical:  { color: [239, 35, 60],  intensity: 0.15, shadowAlpha: 0.50 },
  Legendary: { color: [249, 115, 22], intensity: 0.12, shadowAlpha: 0.40 },
}

function matchConfig(filename) {
  const name = filename.toLowerCase().replace('.png', '')
  for (const [key, cfg] of Object.entries(FRUIT_CONFIG)) {
    if (name.includes(key)) return cfg
  }
  return { rarity: 'Mythical' }
}

function createGlowSVG(size, color, intensity) {
  const [r, g, b] = color
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="g" cx="50%" cy="50%" r="50%">
          <stop offset="25%" stop-color="rgba(${r},${g},${b},0)" />
          <stop offset="50%" stop-color="rgba(${r},${g},${b},${intensity * 0.3})" />
          <stop offset="70%" stop-color="rgba(${r},${g},${b},${intensity})" />
          <stop offset="100%" stop-color="rgba(${r},${g},${b},0)" />
        </radialGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#g)" />
    </svg>`
  )
}

function createShadowSVG(size, x, y, w, h, alpha) {
  const blur = Math.round(size * 0.025)
  const rx = Math.round(size * 0.04)
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="b" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="${blur}" />
        </filter>
      </defs>
      <rect x="${x + Math.round(size * 0.012)}"
            y="${y + Math.round(size * 0.016)}"
            width="${w}" height="${h}"
            rx="${rx}" ry="${rx}"
            fill="rgba(0,0,0,${alpha})"
            filter="url(#b)" />
    </svg>`
  )
}

function createReflectOverlay(size) {
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="r" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(255,255,255,0.06)" />
          <stop offset="40%" stop-color="rgba(255,255,255,0)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#r)" />
    </svg>`
  )
}

function createVignette(size) {
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="v" cx="50%" cy="50%" r="60%">
          <stop offset="60%" stop-color="rgba(0,0,0,0)" />
          <stop offset="100%" stop-color="rgba(0,0,0,0.35)" />
        </radialGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#v)" />
    </svg>`
  )
}

async function removeBlackBackground(inputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { width, height, channels } = info
  const out = Buffer.alloc(width * height * 4)

  const edgeSamples = []
  for (let x = 0; x < width; x++) {
    const topIdx = x * channels
    const botIdx = ((height - 1) * width + x) * channels
    edgeSamples.push(data[topIdx], data[topIdx + 1], data[topIdx + 2])
    edgeSamples.push(data[botIdx], data[botIdx + 1], data[botIdx + 2])
  }
  for (let y = 0; y < height; y++) {
    const leftIdx = y * width * channels
    const rightIdx = (y * width + width - 1) * channels
    edgeSamples.push(data[leftIdx], data[leftIdx + 1], data[leftIdx + 2])
    edgeSamples.push(data[rightIdx], data[rightIdx + 1], data[rightIdx + 2])
  }

  const avgEdge = edgeSamples.reduce((a, b) => a + b, 0) / edgeSamples.length
  const isDarkBg = avgEdge < 60

  if (!isDarkBg) {
    console.log(`  ↳ No dark background detected, skipping removal`)
    return null
  }

  for (let i = 0; i < width * height; i++) {
    const si = i * channels
    const di = i * 4
    const r = data[si], g = data[si + 1], b = data[si + 2], a = data[si + 3]
    const brightness = (r + g + b) / 3
    const isBlack = brightness < BG_THRESHOLD && a > 0

    if (isBlack) {
      const distToEdge = Math.min(
        i % width, width - (i % width),
        Math.floor(i / width), height - Math.floor(i / width)
      )
      const fadeFactor = Math.min(1, Math.max(0, (BG_THRESHOLD - brightness) / BG_THRESHOLD))
      const edgeFactor = Math.min(1, distToEdge / 20)
      const alpha = Math.round(255 * (1 - fadeFactor * edgeFactor))
      out[di] = r; out[di + 1] = g; out[di + 2] = b; out[di + 3] = alpha
    } else {
      out[di] = r; out[di + 1] = g; out[di + 2] = b; out[di + 3] = a
    }
  }

  const result = await sharp(out, { raw: { width, height, channels: 4 } })
    .png()
    .toBuffer()

  console.log(`  ↳ Black background removed`)
  return result
}

async function getContentBounds(buffer, width, height) {
  const rgba = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer()

  let minX = width, minY = height, maxX = 0, maxY = 0
  let hasContent = false

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      if (rgba[idx + 3] > 15) {
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
        hasContent = true
      }
    }
  }

  if (!hasContent) return { x: 0, y: 0, w: width, h: height, cx: width / 2, cy: height / 2 }
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1, cx, cy }
}

const files = readdirSync(FRUITS_DIR).filter(f => f.endsWith('.png') && !f.startsWith('_'))

for (const file of files) {
  const nameKey = file.toLowerCase().replace('.png', '')
  const cfg = FRUIT_CONFIG[nameKey]
  if (!cfg) {
    console.log(`✗ ${file} — skipped (not in target config)`)
    continue
  }

  const inputPath = join(FRUITS_DIR, file)
  console.log(`\nProcessing ${file} (${cfg.rarity})...`)

  // Step 1: Load image, optionally remove black background
  let imageBuffer = null
  const meta = await sharp(inputPath).metadata()
  let { width, height } = meta

  if (cfg.removeBg) {
    const cleaned = await removeBlackBackground(inputPath)
    if (cleaned) {
      imageBuffer = cleaned
      const m = await sharp(cleaned).metadata()
      width = m.width; height = m.height
    } else {
      imageBuffer = await sharp(inputPath).ensureAlpha().png().toBuffer()
    }
  } else {
    imageBuffer = await sharp(inputPath).ensureAlpha().png().toBuffer()
  }

  // Step 2: Find content bounding box
  const bounds = await getContentBounds(imageBuffer, width, height)
  const contentW = bounds.w
  const contentH = bounds.h
  const contentCX = bounds.cx
  const contentCY = bounds.cy

  console.log(`  ↳ Content: ${contentW}x${contentH} at (${Math.round(contentCX)},${Math.round(contentCY)})`)

  // Step 3: Crop to content + small padding
  const pad = 4
  const cropX = Math.max(0, Math.round(contentCX - contentW / 2) - pad)
  const cropY = Math.max(0, Math.round(contentCY - contentH / 2) - pad)
  const cropW = Math.min(width - cropX, contentW + pad * 2)
  const cropH = Math.min(height - cropY, contentH + pad * 2)

  const cropped = await sharp(imageBuffer)
    .extract({ left: cropX, top: cropY, width: cropW, height: cropH })
    .png()
    .toBuffer()

  // Step 4: Scale to fit TARGET_FILL (75%) of canvas
  const targetArea = SIZE * SIZE * TARGET_FILL
  const cropArea = cropW * cropH
  const scale = Math.sqrt(targetArea / cropArea) * 0.92
  const newW = Math.round(cropW * scale)
  const newH = Math.round(cropH * scale)

  const offsetX = Math.round((SIZE - newW) / 2)
  const offsetY = Math.round((SIZE - newH) / 2)

  console.log(`  ↳ Scale: ${scale.toFixed(3)}x → ${newW}x${newH} at (${offsetX},${offsetY})`)

  // Step 5: Enhance: contrast, saturation, sharpen
  const enhanced = await sharp(cropped)
    .resize(newW, newH, { kernel: 'lanczos3', fit: 'fill' })
    .modulate({ brightness: 1.04, saturation: 1.20 })
    .linear(1.25, -18)
    .sharpen({ sigma: 1.4, m1: 0.3, m2: 0.5 })
    .png()
    .toBuffer()

  // Step 6: Build composited output
  const rarity = RARITY_GLOW[cfg.rarity]
  const glowSVG = createGlowSVG(SIZE, rarity.color, rarity.intensity)
  const shadowSVG = createShadowSVG(SIZE, offsetX, offsetY, newW, newH, rarity.shadowAlpha)
  const reflectSVG = createReflectOverlay(SIZE)
  const vignetteSVG = createVignette(SIZE)

  // Background glow (behind everything)
  const bgGlowSVG = Buffer.from(
    `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(${rarity.color[0]},${rarity.color[1]},${rarity.color[2]},0.04)" />
          <stop offset="60%" stop-color="rgba(${rarity.color[0]},${rarity.color[1]},${rarity.color[2]},0.02)" />
          <stop offset="100%" stop-color="rgba(${rarity.color[0]},${rarity.color[1]},${rarity.color[2]},0)" />
        </radialGradient>
      </defs>
      <rect width="${SIZE}" height="${SIZE}" fill="url(#bg)" />
    </svg>`
  )

  const result = await sharp({
    create: { width: SIZE, height: SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  })
    .composite([
      { input: bgGlowSVG, top: 0, left: 0 },
      { input: shadowSVG, top: 0, left: 0 },
      { input: enhanced, top: offsetY, left: offsetX },
      { input: reflectSVG, top: 0, left: 0 },
      { input: glowSVG, top: 0, left: 0 },
      { input: vignetteSVG, top: 0, left: 0 },
    ])
    .png({ compressionLevel: 9 })
    .toFile(inputPath)

  console.log(`  ✓ Saved to ${inputPath}`)
}

console.log(`\n✨ All 9 premium fruits processed successfully!`)
