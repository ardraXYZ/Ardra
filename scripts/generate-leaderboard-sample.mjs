// Run with: node scripts/generate-leaderboard-sample.mjs
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdir, writeFile } from 'node:fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const outDir = join(__dirname, '..', 'data', 'examples')
const outXlsx = join(outDir, 'leaderboard-import.sample.xlsx')

const rows = [
  { refCode: 'YOU',   name: 'You',     points: 1000, feesGenerated: 1250, referrerRefCode: null },
  { refCode: 'REF1',  name: 'Alice',   points:  950, feesGenerated:  300, referrerRefCode: 'YOU' },
  { refCode: 'REF2',  name: 'Bob',     points: 1500, feesGenerated:  500, referrerRefCode: 'YOU' },
  { refCode: 'OTHER', name: 'Charlie', points:  200, feesGenerated:    0, referrerRefCode: null },
  { refCode: 'R3',    name: 'Daisy',   points:  700, feesGenerated:  120, referrerRefCode: 'OTHER' },
  { refCode: 'R4',    name: 'Eve',     points:  300, feesGenerated:   80, referrerRefCode: 'OTHER' },
]

async function main() {
  const mod = await import('xlsx')
  const XLSX = mod.default ?? mod
  await mkdir(outDir, { recursive: true })
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Leaderboard')
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  await writeFile(outXlsx, buf)
  console.log('Wrote sample XLSX:', outXlsx)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

