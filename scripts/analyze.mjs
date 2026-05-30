import sharp from 'sharp'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const dir = join(import.meta.dirname, '..', 'public', 'fruits', 'premium')
const files = readdirSync(dir).filter(f => f.endsWith('.png'))

for (const file of files) {
  const buf = readFileSync(join(dir, file))
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width, height } = info

  let minX = width, minY = height, maxX = 0, maxY = 0, opaquePixels = 0
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * 4 + 3]
      if (a > 20) {
        opaquePixels++
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
      }
    }
  }

  const contentW = maxX - minX + 1
  const contentH = maxY - minY + 1
  const fillPct = ((opaquePixels / (width * height)) * 100).toFixed(1)
  const bboxPct = ((contentW * contentH) / (width * height) * 100).toFixed(1)

  console.log(
    file.padEnd(28) +
    width + 'x' + height +
    ' | bbox: ' + contentW + 'x' + contentH + ' (' + bboxPct + '%)' +
    ' | opaque: ' + fillPct + '%'
  )
}
