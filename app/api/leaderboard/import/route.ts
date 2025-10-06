import { NextResponse } from "next/server"
import { saveImportedLeaderboard, type ImportedPayload } from "@/lib/leaderboard-import"

export const dynamic = "force-dynamic"

function isAuthorized(headers: Headers) {
  const key = process.env.IMPORT_KEY || process.env.LEADERBOARD_IMPORT_KEY
  if (!key) return true // if no key is configured, allow in dev
  return headers.get("x-admin-key") === key
}

export async function POST(req: Request) {
  try {
    if (!isAuthorized(req.headers)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const contentType = req.headers.get("content-type") || ""

    // Accept application/json with { entries: [...], rates?: {...} }
    if (contentType.includes("application/json")) {
      const body = (await req.json()) as ImportedPayload
      if (!body || !Array.isArray((body as any).entries)) {
        return NextResponse.json({ error: "Invalid payload: entries[] required" }, { status: 400 })
      }
      await saveImportedLeaderboard(body)
      return NextResponse.json({ ok: true })
    }

    // Accept multipart/form-data with a file field named "file" (.json, .csv or .xlsx)
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData()
      const file = form.get("file") as File | null
      const pointsRate = Number(form.get("referralPointsRate") ?? 0.10)
      const feesRate = Number(form.get("referralFeesRate") ?? 0.20)
      if (!file) return NextResponse.json({ error: "file required" }, { status: 400 })

      const buf = Buffer.from(await file.arrayBuffer())
      const name = file.name.toLowerCase()
      let payload: ImportedPayload | null = null

      if (name.endsWith(".json")) {
        try {
          const parsed = JSON.parse(buf.toString("utf-8"))
          payload = {
            entries: Array.isArray(parsed) ? parsed : parsed?.entries ?? [],
            rates: { referralPointsRate: pointsRate, referralFeesRate: feesRate },
          }
        } catch {
          return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
        }
      } else if (name.endsWith(".csv")) {
        // Minimal CSV parsing without external deps
        const text = buf.toString("utf-8")
        const rows: string[][] = []
        let cur: string[] = []
        let field = ""
        let inQuotes = false
        for (let i = 0; i < text.length; i++) {
          const ch = text[i]
          const next = text[i + 1]
          if (inQuotes) {
            if (ch === '"') {
              if (next === '"') { field += '"'; i++ } else { inQuotes = false }
            } else { field += ch }
          } else {
            if (ch === ',') { cur.push(field); field = "" }
            else if (ch === '\n') { cur.push(field); rows.push(cur); cur = []; field = "" }
            else if (ch === '\r') { /* ignore */ }
            else if (ch === '"') { inQuotes = true }
            else { field += ch }
          }
        }
        cur.push(field); rows.push(cur)
        if (rows.length === 0) return NextResponse.json({ error: "Empty CSV" }, { status: 400 })
        const header = rows[0].map((h) => (h ?? "").toString().trim().toLowerCase())
        const entries = rows.slice(1).filter(r => r && r.some(c => (c ?? "").toString().trim() !== "")).map((r) => {
          const rec: Record<string, string> = {}
          for (let j = 0; j < header.length; j++) { rec[header[j]] = (r[j] ?? "").toString().trim() }
          return {
            refCode: (rec["refcode"] ?? rec["ref_code"] ?? rec["ref"] ?? rec["code"] ?? "").trim(),
            name: (rec["name"] ?? rec["username"])?.toString()?.trim(),
            points: Number(rec["points"] ?? rec["pts"] ?? rec["totalpoints"] ?? 0),
            feesGenerated: Number(rec["feesgenerated"] ?? rec["fees"] ?? rec["totalfees"] ?? 0),
            referrerRefCode: (rec["referrerrefcode"] ?? rec["referrer"] ?? rec["parent"])?.toString()?.trim() || null,
          }
        })
        payload = { entries, rates: { referralPointsRate: pointsRate, referralFeesRate: feesRate } }
      } else if (name.endsWith(".xlsx")) {
        return NextResponse.json({ error: "XLSX not supported here. Export your sheet as CSV or JSON." }, { status: 400 })
      } else {
        return NextResponse.json({ error: "Unsupported file type (use .json or .csv)" }, { status: 400 })
      }

      await saveImportedLeaderboard(payload)
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: "Unsupported Content-Type" }, { status: 415 })
  } catch (error) {
    console.error("[leaderboard/import]", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
