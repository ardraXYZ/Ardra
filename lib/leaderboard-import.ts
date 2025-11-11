import fs from "node:fs/promises"
import path from "node:path"

export type ImportedEntry = {
  refCode: string
  name?: string
  points?: number
  feesGenerated?: number
  referrerRefCode?: string | null
  perDexPoints?: number
}

export type ImportedPayload = {
  entries: ImportedEntry[]
  perDexEntries?: Record<string, ImportedEntry[]>
  rates?: {
    referralPointsRate?: number
    referralFeesRate?: number
    perDexReferralPointsRate?: number
  }
}

const storePath = path.join(process.cwd(), "data", "leaderboard-import.json")

export async function ensureDataDir() {
  const dir = path.dirname(storePath)
  try {
    await fs.mkdir(dir, { recursive: true })
  } catch {}
}

export async function saveImportedLeaderboard(payload: ImportedPayload) {
  await ensureDataDir()
  const normalizedPerDex =
    payload.perDexEntries && typeof payload.perDexEntries === "object"
      ? Object.fromEntries(
          Object.entries(payload.perDexEntries).map(([dex, arr]) => [dex, Array.isArray(arr) ? arr : []])
        )
      : undefined
  const normalized: ImportedPayload = {
    entries: Array.isArray(payload.entries) ? payload.entries : [],
    perDexEntries: normalizedPerDex,
    rates: {
      referralPointsRate: payload.rates?.referralPointsRate ?? 0.10,
      referralFeesRate: payload.rates?.referralFeesRate ?? 0.20,
      perDexReferralPointsRate: payload.rates?.perDexReferralPointsRate ?? payload.rates?.referralPointsRate ?? 0.20,
    },
  }
  if (!normalized.perDexEntries || Object.keys(normalized.perDexEntries).length === 0) {
    delete normalized.perDexEntries
  }
  await fs.writeFile(storePath, JSON.stringify(normalized, null, 2), "utf-8")
}

export async function loadImportedLeaderboard(): Promise<ImportedPayload | null> {
  try {
    const raw = await fs.readFile(storePath, "utf-8")
    const json = JSON.parse(raw) as ImportedPayload
    if (!json || !Array.isArray(json.entries)) return null
    return json
  } catch {
    return null
  }
}

export type ComputedEntry = {
  id: string
  name: string
  refCode: string
  referrerRefCode?: string | null
  points: number
  referralPoints: number
  totalPoints: number
  feesGenerated: number
  referralFees: number
  totalFees: number
  referrals: number
  perDexPoints?: number
}

export function computeLeaderboardFromImported(
  payload: ImportedPayload,
  sourceEntries?: ImportedEntry[],
  options?: { usePerDexPoints?: boolean }
): ComputedEntry[] {
  const entries = sourceEntries ?? payload.entries ?? []
  const refPointsRate = payload.rates?.referralPointsRate ?? 0.10
  const refFeesRate = payload.rates?.referralFeesRate ?? 0.20
  const selfFeesShareRate = 0.10 // 10% of own fees counts toward Total fees
  const perDexRefRate = payload.rates?.perDexReferralPointsRate ?? refPointsRate

  const childrenByRefCode = new Map<string, ImportedEntry[]>()
  for (const e of entries) {
    const parent = (e.referrerRefCode || "").trim()
    if (!parent) continue
    if (!childrenByRefCode.has(parent)) childrenByRefCode.set(parent, [])
    childrenByRefCode.get(parent)!.push(e)
  }

  const perDexBaseByRefCode = new Map<string, number>(
    entries.map((e) => [e.refCode, Math.max(0, Number(e.perDexPoints ?? 0))])
  )

  const computed: ComputedEntry[] = []
  for (const e of entries) {
    const ownPoints = Math.max(0, Number(e.points ?? 0))
    const ownFees = Math.max(0, Number(e.feesGenerated ?? 0))
    const childs = childrenByRefCode.get(e.refCode) || []
    const earnedRefPoints = childs.reduce((acc, c) => acc + Math.max(0, Number(c.points ?? 0)) * refPointsRate, 0)
    const earnedRefFees = childs.reduce((acc, c) => acc + Math.max(0, Number(c.feesGenerated ?? 0)) * refFeesRate, 0)

    let perDexPointsTotal: number | undefined
    if (options?.usePerDexPoints) {
      const basePerDex = perDexBaseByRefCode.get(e.refCode) ?? 0
      const earnedPerDex = childs.reduce((acc, c) => {
        const childBase = perDexBaseByRefCode.get(c.refCode) ?? 0
        return acc + childBase * perDexRefRate
      }, 0)
      perDexPointsTotal = Math.round(basePerDex + earnedPerDex)
    }

    const name = (e.name && e.name.trim().length > 0) ? e.name.trim() : e.refCode
    const referrals = childs.length
    const referralPoints = Math.round(earnedRefPoints)
    const totalPoints = Math.round(ownPoints + earnedRefPoints)
    const referralFees = Number(earnedRefFees.toFixed(2))
    const totalFees = Number((earnedRefFees + ownFees * selfFeesShareRate).toFixed(2))

    computed.push({
      id: e.refCode,
      name,
      refCode: e.refCode,
      referrerRefCode: e.referrerRefCode ?? null,
      points: ownPoints,
      referralPoints,
      totalPoints,
      feesGenerated: Number(ownFees.toFixed(2)),
      referralFees,
      totalFees,
      referrals,
      perDexPoints: perDexPointsTotal ?? (options?.usePerDexPoints ? Math.round(perDexBaseByRefCode.get(e.refCode) ?? 0) : undefined),
    })
  }

  computed.sort((a, b) => b.totalPoints - a.totalPoints)
  return computed
}
