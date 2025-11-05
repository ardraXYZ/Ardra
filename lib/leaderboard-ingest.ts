import fs from "node:fs/promises"
import path from "node:path"
import { prisma } from "@/lib/prisma"
import { readUsers as readUsersFs } from "@/lib/user-store"
import { saveImportedLeaderboard, type ImportedPayload } from "@/lib/leaderboard-import"

type RawRow = {
  identifier: string
  points: number
  feesGenerated: number
  exchange?: string | null
  exchangePoints?: number | null
}

function isEvmAddress(str: string) {
  return /^0x[0-9a-fA-F]{40}$/.test(str.trim())
}

function isSolanaLikeAddress(str: string) {
  const v = (str ?? "").trim()
  if (!v) return false
  // Base58-ish, exclude 0/O/I/l and punctuation, typical length 32-48
  if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(v)) return false
  return v.length >= 32 && v.length <= 60
}

function normalizeIdentifier(id: string) {
  const v = (id ?? "").trim()
  if (!v) return ""
  return isEvmAddress(v) ? v.toLowerCase() : v
}

function pickIdentifier(rec: Record<string, any>): string | null {
  const keys = Object.keys(rec)
  const lowerMap = new Map(keys.map((k) => [k.toLowerCase(), k]))
  const candidates = [
    "wallet/alias/user",
    "identifier",
    "wallet",
    "evm",
    "sol",
    "solana",
    "walletaddress",
    "address",
    "evmaddress",
    "solanaaddress",
    "publickey",
    "pubkey",
    "owner",
    "alias",
    "user",
    "username",
    "account",
    "handle",
  ]
  for (const c of candidates) {
    const k = lowerMap.get(c)
    if (k && typeof rec[k] === "string") return rec[k] as string
  }
  // fallback: first string field
  for (const k of keys) {
    if (typeof rec[k] === "string") return rec[k]
  }
  return null
}

function pickNumber(rec: Record<string, any>, names: string[], def = 0) {
  const lowerMap = new Map(Object.keys(rec).map((k) => [k.toLowerCase(), k]))
  for (const name of names) {
    const k = lowerMap.get(name)
    if (!k) continue
    const raw = rec[k]
    const num = typeof raw === "number" ? raw : Number(raw)
    if (!Number.isNaN(num)) return num
  }
  return def
}

function pickString(rec: Record<string, any>, names: string[], def: string | null = null) {
  const lowerMap = new Map(Object.keys(rec).map((k) => [k.toLowerCase(), k]))
  for (const name of names) {
    const k = lowerMap.get(name)
    if (!k) continue
    const raw = rec[k]
    if (typeof raw === "string" && raw.trim()) return raw.trim()
    if (raw != null && typeof raw.toString === "function") {
      const text = raw.toString().trim()
      if (text) return text
    }
  }
  return def
}

function parseCSV(content: string): Record<string, string>[] {
  const rows: string[][] = []
  let cur: string[] = []
  let field = ""
  let inQuotes = false
  for (let i = 0; i < content.length; i++) {
    const ch = content[i]
    const next = content[i + 1]
    if (inQuotes) {
      if (ch === '"') {
        if (next === '"') { // escaped quote
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
    } else {
      if (ch === ',') {
        cur.push(field)
        field = ""
      } else if (ch === '\n') {
        cur.push(field)
        rows.push(cur)
        cur = []
        field = ""
      } else if (ch === '\r') {
        // ignore, handle with \n
      } else if (ch === '"') {
        inQuotes = true
      } else {
        field += ch
      }
    }
  }
  // push last
  cur.push(field)
  rows.push(cur)

  if (rows.length === 0) return []

  function isNumericLike(s: string) {
    const t = (s ?? "").trim()
    if (!t) return false
    if (!/^[-+]?\d*(?:\.|\,)??\d+(?:[eE][-+]?\d+)?$/.test(t.replace(/,/g, ""))) return false
    const n = Number(t.replace(/,/g, ""))
    return Number.isFinite(n)
  }

  // Detect headerless CSV: first row looks like data
  const r0 = rows[0]
  const r1 = rows[1]
  const firstLooksAddress = !!(r0 && r0.length >= 1 && (isEvmAddress(r0[0]) || isSolanaLikeAddress(r0[0])))
  const secondLooksAddress = !!(r0 && r0.length >= 2 && (isEvmAddress(r0[1]) || isSolanaLikeAddress(r0[1])))

  const headerlessLayout = (() => {
    if (!r0) return null
    if (firstLooksAddress) {
      return {
        exchangeIndex: null as number | null,
        identifierIndex: 0,
        pointsIndex: r0.length > 1 ? 1 : -1,
        feesIndex: r0.length > 2 ? 2 : -1,
        dexPointsIndex: r0.length > 3 ? 3 : -1,
      }
    }
    if (secondLooksAddress) {
      return {
        exchangeIndex: 0,
        identifierIndex: 1,
        pointsIndex: r0.length > 2 ? 2 : -1,
        feesIndex: r0.length > 3 ? 3 : -1,
        dexPointsIndex: r0.length > 4 ? 4 : -1,
      }
    }
    return null
  })()

  const looksHeaderless = !!(
    headerlessLayout &&
    (!r1 || r1.length === r0.length) &&
    (headerlessLayout.pointsIndex === -1 ||
      isNumericLike(r0[headerlessLayout.pointsIndex] || "") ||
      r0[headerlessLayout.pointsIndex] === "") &&
    (headerlessLayout.feesIndex === -1 ||
      isNumericLike(r0[headerlessLayout.feesIndex] || "") ||
      r0[headerlessLayout.feesIndex] === "") &&
    (headerlessLayout.dexPointsIndex === -1 ||
      r0.length <= headerlessLayout.dexPointsIndex ||
      isNumericLike(r0[headerlessLayout.dexPointsIndex] || "") ||
      r0[headerlessLayout.dexPointsIndex] === "")
  )

  const out: Record<string, string>[] = []
  if (looksHeaderless && headerlessLayout) {
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i]
      if (!r || r.every((c) => (c ?? "").toString().trim() === "")) continue
      const obj: Record<string, string> = {}
      if (headerlessLayout.exchangeIndex != null && r.length > headerlessLayout.exchangeIndex) {
        const val = (r[headerlessLayout.exchangeIndex] ?? "").toString().trim()
        if (val) {
          obj["exchange"] = val
          obj["corretora"] = val
        }
      }
      if (r.length > headerlessLayout.identifierIndex) {
        obj["identifier"] = (r[headerlessLayout.identifierIndex] ?? "").toString().trim()
      }
      if (headerlessLayout.pointsIndex !== -1 && r.length > headerlessLayout.pointsIndex) {
        obj["points"] = (r[headerlessLayout.pointsIndex] ?? "").toString().trim()
      }
      if (headerlessLayout.feesIndex !== -1 && r.length > headerlessLayout.feesIndex) {
        obj["feesgenerated"] = (r[headerlessLayout.feesIndex] ?? "").toString().trim()
      }
      const dynamicDexIndex =
        headerlessLayout.dexPointsIndex !== -1
          ? headerlessLayout.dexPointsIndex
          : headerlessLayout.feesIndex !== -1
            ? headerlessLayout.feesIndex + 1
            : -1
      if (dynamicDexIndex !== -1) {
        let val = ""
        if (r.length > dynamicDexIndex) {
          val = (r[dynamicDexIndex] ?? "").toString().trim()
        }
        obj["exchangepoints"] = val
        obj["dexpoints"] = val
        obj["perpdexpoints"] = val
      }
      out.push(obj)
    }
    return out
  }

  // Normal CSV with header in first row
  const header = rows[0].map((h) => (h ?? "").toString().trim())
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i]
    if (!r || r.every((c) => (c ?? "").toString().trim() === "")) continue
    const obj: Record<string, string> = {}
    for (let j = 0; j < header.length; j++) {
      const key = header[j]?.toLowerCase() ?? `col${j}`
      obj[key] = (r[j] ?? "").toString().trim()
    }
    out.push(obj)
  }
  return out
}

async function parseBuffer(filename: string, buf: Buffer): Promise<RawRow[]> {
  const lower = filename.toLowerCase()
  if (lower.endsWith(".json")) {
    const data = JSON.parse(buf.toString("utf-8"))
    const arr: any[] = Array.isArray(data) ? data : Array.isArray(data?.rows) ? data.rows : data?.entries ?? []
    const rows: RawRow[] = []
    for (const rec of arr) {
      if (!rec || typeof rec !== "object") continue
      const id = pickIdentifier(rec)
      if (!id) continue
      const points = pickNumber(rec, ["volume", "notional", "points", "pts", "totalpoints", "score"], 0)
      const fees = pickNumber(rec, ["feesgenerated", "fees", "totalfees"], 0)
      const exchange = pickString(rec, ["exchange", "dex", "perpdex", "broker", "venue", "market", "corretora"], null)
      let exchangePoints = pickNumber(
        rec,
        ["exchangepoints", "dexpoints", "perpdexpoints", "campaignpoints", "sharepoints"],
        Number.NaN
      )
      if (!Number.isFinite(exchangePoints) && "points" in rec && "volume" in rec) {
        const explicit = pickNumber(rec, ["points"], Number.NaN)
        if (Number.isFinite(explicit)) exchangePoints = explicit
      }
      const normalizedExchangePoints = Number.isFinite(exchangePoints) ? exchangePoints : null
      if (normalizedExchangePoints != null && process.env.NODE_ENV !== "production") {
        console.log("[ingest:csv] points", filename, id, normalizedExchangePoints)
      }
      rows.push({
        identifier: id,
        points,
        feesGenerated: fees,
        exchange,
        exchangePoints: normalizedExchangePoints,
      })
    }
    return rows
  }

  if (lower.endsWith(".csv")) {
    const recs = parseCSV(buf.toString("utf-8"))
    const rows: RawRow[] = []
    for (const rec of recs) {
      const id = pickIdentifier(rec)
      if (!id) continue
      const points = pickNumber(rec, ["volume", "notional", "points", "pts", "totalpoints", "score"], 0)
      const fees = pickNumber(rec, ["feesgenerated", "fees", "totalfees"], 0)
      const exchange = pickString(rec, ["exchange", "dex", "perpdex", "broker", "venue", "market", "corretora"], null)
      let exchangePoints = pickNumber(
        rec,
        ["exchangepoints", "dexpoints", "perpdexpoints", "campaignpoints", "sharepoints"],
        Number.NaN
      )
      if (!Number.isFinite(exchangePoints) && "points" in rec && "volume" in rec) {
        const explicit = pickNumber(rec, ["points"], Number.NaN)
        if (Number.isFinite(explicit)) exchangePoints = explicit
      }
      rows.push({
        identifier: id,
        points,
        feesGenerated: fees,
        exchange,
        exchangePoints: Number.isFinite(exchangePoints) ? exchangePoints : null,
      })
    }
    return rows
  }

  // XLSX intentionally unsupported to keep deploy simple. Export as CSV or JSON.

  throw new Error(`Unsupported file type: ${filename}`)
}

export async function ingestReportsFromDir(dirPath: string) {
  // 1) Load users and build identity maps
  let users: { id: string; refCode: string; name?: string | null; username?: string | null; profileWallets?: any }[] = []
  let wallets: { userId: string; address: string }[] = []
  try {
    users = await prisma.user.findMany({
      select: { id: true, refCode: true, name: true, username: true, profileWallets: true },
    })
  } catch {}
  try {
    wallets = await prisma.wallet.findMany({ select: { userId: true, address: true } })
  } catch {}
  const byUserId = new Map(users.map((u) => [u.id, u]))

  // Build identifier -> owners maps while preferring canonical wallet ownership
  const idOwners = new Map<string, Set<string>>()
  const idLowerOwners = new Map<string, Set<string>>()
  const canonicalOwnerExact = new Map<string, string>() // from wallets table
  const canonicalOwnerLower = new Map<string, string>()

  function addOwner(map: Map<string, Set<string>>, key: string, refCode: string) {
    if (!map.has(key)) map.set(key, new Set())
    map.get(key)!.add(refCode)
  }

  // 2.1 First, index canonical wallet addresses
  for (const w of wallets) {
    const addr = normalizeIdentifier(w.address || "")
    if (!addr) continue
    const refCode = byUserId.get(w.userId)?.refCode
    if (!refCode) continue
    addOwner(idOwners, addr, refCode)
    const low = addr.toLowerCase()
    addOwner(idLowerOwners, low, refCode)
    canonicalOwnerExact.set(addr, refCode)
    canonicalOwnerLower.set(low, refCode)
  }

  // 2.2 Then, add profile-provided identifiers only if not conflicting with canonical
  function* collectStringsDeep(input: unknown): Generator<string> {
    if (typeof input === "string") {
      const trimmed = input.trim()
      if (trimmed) yield trimmed
      return
    }
    if (Array.isArray(input)) {
      for (const v of input) yield* collectStringsDeep(v)
      return
    }
    if (input && typeof input === "object") {
      for (const v of Object.values(input as Record<string, unknown>)) {
        yield* collectStringsDeep(v)
      }
    }
  }
  const profileConflictsIgnored: { identifier: string; owner: string; conflictedWith: string }[] = []
  for (const u of users) {
    if (u.profileWallets && typeof u.profileWallets === "object") {
      for (const val of collectStringsDeep(u.profileWallets)) {
        const norm = normalizeIdentifier(val)
        if (!norm) continue
        const low = norm.toLowerCase()
        const canonical = canonicalOwnerExact.get(norm) ?? canonicalOwnerLower.get(low)
        if (canonical && canonical !== u.refCode) {
          // Conflict: identifier already belongs to someone else via canonical wallet table
          profileConflictsIgnored.push({ identifier: norm, owner: u.refCode, conflictedWith: canonical })
          continue
        }
        addOwner(idOwners, norm, u.refCode)
        addOwner(idLowerOwners, low, u.refCode)
      }
    }
  }

  // 2) Also index file-store users if DB is empty (or as complement)
  try {
    const fsUsers = await readUsersFs()
    if (Array.isArray(fsUsers) && fsUsers.length > 0) {
      for (const u of fsUsers) {
        // Merge if refCode already present from DB; otherwise add as standalone owner source
        const refCode = u.refCode
        const allVals = Object.values(u.wallets || {}).filter((v) => typeof v === "string" && v.trim()) as string[]
        for (const raw of allVals) {
          const norm = normalizeIdentifier(raw)
          if (!norm) continue
          const low = norm.toLowerCase()
          addOwner(idOwners, norm, refCode)
          addOwner(idLowerOwners, low, refCode)
        }
      }
    }
  } catch {}

  // 3) Read files
  const fullDir = path.isAbsolute(dirPath) ? dirPath : path.join(process.cwd(), dirPath)
  await fs.mkdir(fullDir, { recursive: true })
  const files = (await fs.readdir(fullDir)).filter((f) => /\.(json|xlsx|csv)$/i.test(f))

  const aggregated = new Map<string, { points: number; fees: number; dexPoints?: number }>() // by refCode
  const aggregatedByDex = new Map<
    string,
    { label: string; entries: Map<string, { points: number; fees: number; dexPoints: number }> }
  >()
  const unknownIdentifiers: { file: string; value: string }[] = []
  const ambiguousIdentifiers: { file: string; value: string; owners: string[] }[] = []

  for (const f of files) {
    const p = path.join(fullDir, f)
    const buf = await fs.readFile(p)
    const rows = await parseBuffer(f, buf)
    for (const row of rows) {
      const id = row.identifier
      const lower = id.toLowerCase()
      const setExact = idOwners.get(id) || idLowerOwners.get(lower)
      if (!setExact || setExact.size === 0) {
        unknownIdentifiers.push({ file: f, value: id })
        continue
      }
      if (process.env.NODE_ENV !== "production") {
        console.log("[ingest:match]", id, Array.from(setExact))
        if (Number(row.exchangePoints ?? 0) > 0) {
          console.log("[ingest:dexPoints]", row.exchange, id, row.exchangePoints)
        }
      }
      let chosen: string | null = null
      if (setExact.size > 1) {
        // Try to disambiguate using canonical owner preference
        const canonical = canonicalOwnerExact.get(id) ?? canonicalOwnerLower.get(lower) ?? null
        if (canonical) {
          chosen = canonical
        } else {
          ambiguousIdentifiers.push({ file: f, value: id, owners: Array.from(setExact) })
          continue
        }
      } else {
        chosen = Array.from(setExact)[0]
      }
      const exact = chosen
      const volumeContribution = Math.max(0, Number(row.points || 0))
      const shareContribution = Number.isFinite(row.exchangePoints as number)
        ? Math.max(0, Number(row.exchangePoints || 0))
        : 0

      const acc = aggregated.get(exact) || { points: 0, fees: 0, dexPoints: 0 }
      acc.points += volumeContribution
      acc.fees += Math.max(0, Number(row.feesGenerated || 0))
      acc.dexPoints = (acc.dexPoints ?? 0) + shareContribution
      aggregated.set(exact, acc)

      const rawExchange = typeof row.exchange === "string" ? row.exchange : ""
      const exchange = rawExchange.trim()
      if (exchange) {
        const normalized = exchange.toLowerCase()
        let bucket = aggregatedByDex.get(normalized)
        if (!bucket) {
          bucket = { label: exchange, entries: new Map() }
          aggregatedByDex.set(normalized, bucket)
        }
        const dexMap = bucket.entries
        const dexAcc = dexMap.get(exact) || { points: 0, fees: 0, dexPoints: 0 }
        dexAcc.points += volumeContribution
        dexAcc.fees += Math.max(0, Number(row.feesGenerated || 0))
        dexAcc.dexPoints += shareContribution
        dexMap.set(exact, dexAcc)
        // ensure latest non-empty label wins if previous was empty-ish
        if (!bucket.label || bucket.label.trim().length === 0) {
          bucket.label = exchange
        }
      }
    }
  }

  // 4) Build entries with referral graph from DB, with FS fallback
  let allUsers: { id: string; refCode: string; name?: string | null; username?: string | null }[] = []
  try {
    allUsers = await prisma.user.findMany({ select: { id: true, refCode: true, name: true, username: true } })
  } catch {}
  if (!allUsers || allUsers.length === 0) {
    try {
      const fsUsers = await readUsersFs()
      allUsers = fsUsers.map((u) => ({ id: u.id, refCode: u.refCode, name: u.name, username: u.slug }))
    } catch {}
  }
  const idByRefCode = new Map(allUsers.map((u) => [u.refCode, u.id]))
  const nameByRefCode = new Map(
    allUsers.map((u) => [u.refCode, (u.username && u.username.length > 0) ? u.username : (u.name ?? "Pilot")])
  )

  let referrerByChildRefCode = new Map<string, string>()
  try {
    const refs = await prisma.referral.findMany({ select: { referrerId: true, referredId: true } })
    referrerByChildRefCode = new Map(
      refs
        .map((r) => {
          const childRefCode = allUsers.find((u) => u.id === r.referredId)?.refCode
          const parentRefCode = allUsers.find((u) => u.id === r.referrerId)?.refCode
          return childRefCode && parentRefCode ? [childRefCode, parentRefCode] as const : null
        })
        .filter((x): x is readonly [string, string] => !!x)
    )
  } catch {
    // FS fallback: build from users' referredBy field if present
    try {
      const fsUsers = await readUsersFs()
      referrerByChildRefCode = new Map(
        fsUsers
          .map((u) => {
            if (!u.referredBy) return null
            const child = u.refCode
            const parentRef = fsUsers.find((p) => p.id === u.referredBy)?.refCode
            return parentRef ? [child, parentRef] as const : null
          })
          .filter((x): x is readonly [string, string] => !!x)
      )
    } catch {}
  }

  const mapToImportedEntries = (
    source: Iterable<[string, { points: number; fees: number; dexPoints?: number }]>
  ) =>
    Array.from(source).map(([refCode, sums]) => {
      const volumePoints = Math.max(0, Number(sums.points ?? 0))
      const entry: ImportedEntry = {
        refCode,
        name: nameByRefCode.get(refCode),
        points: Math.round(volumePoints),
        feesGenerated: Number(sums.fees.toFixed(2)),
        referrerRefCode: referrerByChildRefCode.get(refCode) ?? null,
      }
      if (Number.isFinite(sums.dexPoints as number)) {
        entry.perDexPoints = Math.round(Number(sums.dexPoints))
      }
      return entry
    })

  const entries = mapToImportedEntries(aggregated.entries())

  const perDexEntriesRecord: Record<string, typeof entries> = {}
  if (process.env.NODE_ENV !== "production") {
    for (const [dexKey, { entries: perDexMap }] of aggregatedByDex.entries()) {
      console.log("[ingest] dex aggregate", dexKey, Array.from(perDexMap.entries()))
    }
  }
  for (const { label, entries: perDexMap } of aggregatedByDex.values()) {
    const key = label.trim() || "unknown"
    perDexEntriesRecord[key] = mapToImportedEntries(perDexMap.entries())
  }

  const payload: ImportedPayload = {
    rates: { referralPointsRate: 0.10, referralFeesRate: 0.20, perDexReferralPointsRate: 0.20 },
    entries,
    perDexEntries: Object.keys(perDexEntriesRecord).length > 0 ? perDexEntriesRecord : undefined,
  }

  await saveImportedLeaderboard(payload)

  return {
    dir: fullDir,
    files,
    importedCount: entries.length,
    unknownIdentifiers,
    ambiguousIdentifiers,
    profileConflictsIgnored,
    perDexPreview: Object.fromEntries(
      Array.from(aggregatedByDex.entries()).map(([key, { label, entries: map }]) => [
        label.trim() || key,
        Array.from(map.entries()),
      ])
    ),
  }
}
