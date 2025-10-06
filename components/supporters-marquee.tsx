import fs from "node:fs"
import path from "node:path"
import { SupporterCarousel } from "@/components/supporter-carousel"

function toAlt(file: string) {
  return file
    .replace(/[-_]/g, " ")
    .replace(/\.(png|jpg|jpeg|svg|webp)$/i, "")
}

export async function SupportersMarquee() {
  const supportDirLocal = path.join(process.cwd(), "Images", "Support")
  const publicSupportDir = path.join(process.cwd(), "public", "images", "support")
  const fallbacks = [
    "/images/airdrop_engine_aurora_soft.svg",
    "/images/ardra_lockup_horizontal_aurora_orbitron_fix.svg",
    "/images/airdrop_engine_cyan.svg",
    "/images/ardra_lockup_stacked_mono_orbitron_fix.svg",
  ]

  const pickDir = fs.existsSync(supportDirLocal)
    ? supportDirLocal
    : (fs.existsSync(publicSupportDir) ? publicSupportDir : null)

  let logos: { src: string; alt: string }[] = []

  try {
    if (pickDir) {
      const files = fs
        .readdirSync(pickDir)
        .filter((f) => /\.(png|jpe?g|svg|webp)$/i.test(f))

      if (files.length) {
        console.log("[SupportersMarquee] using", pickDir, "with", files.length, "logos")
        logos = files.map((file) => {
          const ext = path.extname(file).toLowerCase()
          const mime =
            ext === ".png" ? "image/png" :
            ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" :
            ext === ".webp" ? "image/webp" :
            ext === ".svg" ? "image/svg+xml" : "application/octet-stream"
          const abs = path.join(pickDir, file)
          const buf = fs.readFileSync(abs)
          const src = `data:${mime};base64,${buf.toString("base64")}`
          return { src, alt: toAlt(file) }
        })
      }
    }
  } catch {}

  if (!logos.length) {
    logos = fallbacks.map((src) => ({ src, alt: toAlt(path.basename(src)) }))
    console.log("[SupportersMarquee] fallback logos")
  }

  return <SupporterCarousel logos={logos} />
}
