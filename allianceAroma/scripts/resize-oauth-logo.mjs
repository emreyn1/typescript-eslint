#!/usr/bin/env node
/**
 * Google OAuth Branding icin 128x128 logo olusturur.
 * Kullanim: pnpm run resize-logo
 * veya: node scripts/resize-oauth-logo.mjs
 */
import { readFile, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")
const input = join(root, "public", "logo.png")
const output = join(root, "public", "logo-128.png")

async function main() {
  let sharp
  try {
    sharp = (await import("sharp")).default
  } catch {
    console.error("sharp paketi gerekli. Yuklemek icin: pnpm add -D sharp")
    process.exit(1)
  }

  try {
    const buf = await readFile(input)
    await sharp(buf)
      .resize(128, 128)
      .png()
      .toFile(output)
    console.log("OK: public/logo-128.png olusturuldu (128x128)")
  } catch (err) {
    if (err.code === "ENOENT") {
      console.error("Hata: public/logo.png bulunamadi. Once logo.png ekle.")
    } else {
      console.error("Hata:", err.message)
    }
    process.exit(1)
  }
}

main()
