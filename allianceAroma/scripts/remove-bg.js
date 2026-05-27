/**
 * Removes white/light backgrounds from product JPGs and saves as PNG.
 * Run: node scripts/remove-bg.js
 */
const sharp = require("sharp")
const fs = require("fs")
const path = require("path")

const PRODUCTS_DIR = path.join(__dirname, "../public/products")
const THRESHOLD_FULL = 250 // pixels brighter than this = fully transparent
const THRESHOLD_EDGE = 235 // pixels between 235-250 = gradient for smooth edges

async function processImage(filename) {
  const inputPath = path.join(PRODUCTS_DIR, filename)
  const baseName = filename.replace(/\.(jpg|jpeg)$/i, "")
  const outputPath = path.join(PRODUCTS_DIR, `${baseName}.png`)

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const brightness = Math.max(r, g, b)
    const minChannel = Math.min(r, g, b)

    // Light/white background: all channels high
    if (minChannel > THRESHOLD_FULL) {
      data[i + 3] = 0
    } else if (minChannel > THRESHOLD_EDGE) {
      const t = (minChannel - THRESHOLD_EDGE) / (THRESHOLD_FULL - THRESHOLD_EDGE)
      data[i + 3] = Math.round((1 - t * t) * 255)
    }
  }

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(outputPath)

  return baseName
}

async function main() {
  const files = fs.readdirSync(PRODUCTS_DIR).filter((f) => /\.(jpg|jpeg)$/i.test(f))
  console.log(`Processing ${files.length} images...`)

  let done = 0
  for (const file of files) {
    try {
      await processImage(file)
      done++
      if (done % 20 === 0) console.log(`  ${done}/${files.length}`)
    } catch (err) {
      console.error(`Error ${file}:`, err.message)
    }
  }

  console.log(`Done. ${done} PNGs created.`)
}

main().catch(console.error)
