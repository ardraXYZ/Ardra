import { NextResponse } from "next/server"
import { ingestReportsFromDir } from "@/lib/leaderboard-ingest"

export const dynamic = "force-dynamic"

function isAuthorized(headers: Headers) {
  const key = process.env.IMPORT_KEY || process.env.LEADERBOARD_IMPORT_KEY
  if (!key) return true
  return headers.get("x-admin-key") === key
}

export async function GET(req: Request) {
  try {
    if (!isAuthorized(req.headers)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const dir = process.env.LEADERBOARD_REPORTS_DIR || "data/reports"
    const res = await ingestReportsFromDir(dir)
    return NextResponse.json({ ok: true, ...res })
  } catch (error) {
    console.error("[leaderboard/import/ingest]", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
